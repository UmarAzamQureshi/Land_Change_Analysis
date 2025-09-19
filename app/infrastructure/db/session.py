from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.orm import with_loader_criteria
from app.config.settings import settings
from .models import UserModel

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session with soft delete filter"""
    db = SessionLocal()
    
    # Add global soft delete filter for UserModel
    @event.listens_for(db, "do_orm_execute")
    def _add_soft_delete_filter(execute_state):
        if (
            execute_state.is_select
            and not execute_state.is_column_load
            and not execute_state.is_relationship_load
        ):
            # Automatically filter out soft-deleted users
            execute_state.statement = execute_state.statement.options(
                with_loader_criteria(
                    UserModel,
                    lambda cls: cls.is_deleted == False,
                    include_aliases=True,
                )
            )
    
    return db


def get_db_with_deleted() -> Session:
    """Get database session without soft delete filter (for admin operations)"""
    return SessionLocal()


