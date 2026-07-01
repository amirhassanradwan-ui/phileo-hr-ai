from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class CurrentUser(BaseModel):
    username: str
    full_name: str
    role: str
    email: str
