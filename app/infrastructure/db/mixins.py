from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean
from sqlalchemy.ext.declarative import declared_attr


class SoftDeleteMixin:
    """Mixin to add soft delete functionality to models"""
    
    @declared_attr
    def deleted_at(cls):
        return Column(DateTime(timezone=True), nullable=True, index=True)
    
    @declared_attr
    def is_deleted(cls):
        return Column(Boolean, default=False, index=True)
    
    def soft_delete(self):
        """Mark the record as deleted"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
    
    def restore(self):
        """Restore the deleted record"""
        self.is_deleted = False
        self.deleted_at = None
