from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pymongo.database import Database

from Backend.FashionAI.backend import auth, crud
from Backend.FashionAI.backend import schemas
from Backend.FashionAI.backend.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError as exc:
        raise credentials_exception from exc

    user = crud.get_user_by_email(db, token_data.email)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user


def get_current_fully_registered_user(current_user: dict = Depends(get_current_active_user)) -> dict:
    if not current_user.get("is_fully_registered"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete registration step 2 before using this feature",
        )
    return current_user
