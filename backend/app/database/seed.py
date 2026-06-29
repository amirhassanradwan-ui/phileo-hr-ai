from sqlalchemy import select

from app.core.security import hash_password
from app.database.session import Base, SessionLocal, engine
from app import models  # noqa: F401
from app.models.user import User

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


def seed_admin() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.username == ADMIN_USERNAME))
        if existing:
            print("Admin user already exists")
            return

        user = User(
            username=ADMIN_USERNAME,
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name="System Admin",
            role="admin",
            email="admin@phileo.local",
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("Created admin user: admin / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
