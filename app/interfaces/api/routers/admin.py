from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.interfaces.schemas.user import UserResponse, UserCreate
from app.interfaces.dependencies import get_user_repo, require_admin
from app.application.use_cases.admin_user_ops import create_user_admin, list_users, delete_user, update_user_role
from app.infrastructure.security.passlib_hasher import PasslibPasswordHasher
from app.domain.entities.user import User
from app.domain.value_objects.role import UserRole


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/users", response_model=UserResponse)
async def create_user_endpoint(user_data: UserCreate, repo=Depends(get_user_repo)):
    try:
        hasher = PasslibPasswordHasher()
        domain_user = User(
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hasher.hash(user_data.password),
            role=user_data.role,
        )
        return create_user_admin(repo, domain_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users", response_model=List[UserResponse])
async def list_all_users_endpoint(repo=Depends(get_user_repo), skip: int = 0, limit: int = 100):
    return list_users(repo, skip=skip, limit=limit)


@router.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: int, repo=Depends(get_user_repo)):
    delete_user(repo, user_id)
    return {"message": "User deleted successfully"}


@router.put("/users/{user_id}/role")
async def update_user_role_endpoint(user_id: int, role: UserRole, repo=Depends(get_user_repo)):
    update_user_role(repo, user_id, role)
    return {"message": f"User role updated to {role.value}"}


