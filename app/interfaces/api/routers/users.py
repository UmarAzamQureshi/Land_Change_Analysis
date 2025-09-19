from fastapi import APIRouter, Depends, HTTPException
from app.interfaces.schemas.user import UserResponse, UserItem
from app.interfaces.dependencies import get_current_user, get_admin_user_ops
from app.application.use_cases.admin_user_ops import AdminUserOperations

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user


@router.get("/me/items", response_model=list[UserItem])
async def read_users_me_items(current_user = Depends(get_current_user)):
    return [{"item_id": "Foo", "owner": current_user.username}]


@router.get("/profile")
async def get_user_profile(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "auth_provider": current_user.auth_provider,
        "created_at": current_user.created_at,
    }


# Admin endpoints for soft delete operations
@router.delete("/{user_id}", response_model=dict)
async def soft_delete_user(
    user_id: int,
    admin_ops: AdminUserOperations = Depends(get_admin_user_ops)
):
    """Soft delete a user"""
    success = admin_ops.soft_delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User soft deleted successfully"}


@router.post("/{user_id}/restore", response_model=dict)
async def restore_user(
    user_id: int,
    admin_ops: AdminUserOperations = Depends(get_admin_user_ops)
):
    """Restore a soft-deleted user"""
    success = admin_ops.restore_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found or not deleted")
    return {"message": "User restored successfully"}


@router.get("/deleted", response_model=dict)
async def get_deleted_users(
    admin_ops: AdminUserOperations = Depends(get_admin_user_ops)
):
    """Get all soft-deleted users (admin only)"""
    deleted_users = admin_ops.get_deleted_users()
    return {"deleted_users": [{"id": u.id, "username": u.username, "deleted_at": u.deleted_at} for u in deleted_users]}


