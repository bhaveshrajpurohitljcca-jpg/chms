from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.notification import Notification, NotificationType


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        type: NotificationType,
        title: str,
        message: str
    ) -> Notification:
        db_notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            is_read=False
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        is_read: Optional[bool] = None
    ) -> Tuple[List[Notification], int, int]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
            
        total = query.count()
        
        # Calculate overall unread count for the user
        unread_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        
        notifications = query.order_by(desc(Notification.created_at))\
            .offset((page - 1) * limit)\
            .limit(limit)\
            .all()
            
        return notifications, total, unread_count

    @staticmethod
    def mark_as_read(db: Session, user_id: str, notification_id: str) -> Optional[Notification]:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> int:
        unread_notifications = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).all()
        
        for n in unread_notifications:
            n.is_read = True
            
        db.commit()
        return len(unread_notifications)


notification_service = NotificationService()


class NotificationEventDispatcher:
    @staticmethod
    def dispatch_user_registration(db: Session, user_id: str, full_name: str):
        title = "Welcome to CHMS!"
        message = f"Hello {full_name}, your registration was successful. Welcome to the College Hackathon Management System."
        notification_service.create_notification(db, user_id, NotificationType.USER_REGISTRATION, title, message)

    @staticmethod
    def dispatch_login_success(db: Session, user_id: str):
        title = "Login Alert"
        message = "You have successfully logged in to your account."
        notification_service.create_notification(db, user_id, NotificationType.LOGIN_SUCCESS, title, message)

    @staticmethod
    def dispatch_profile_updated(db: Session, user_id: str):
        title = "Profile Updated"
        message = "Your personal profile information has been successfully updated."
        notification_service.create_notification(db, user_id, NotificationType.PROFILE_UPDATED, title, message)

    @staticmethod
    def dispatch_password_changed(db: Session, user_id: str):
        title = "Password Changed"
        message = "Your account password has been successfully updated."
        notification_service.create_notification(db, user_id, NotificationType.PASSWORD_CHANGED, title, message)

    @staticmethod
    def dispatch_unauthorized_access(db: Session, user_id: str, path: str):
        title = "Security Alert: Unauthorized Access Attempt"
        message = f"An unauthorized attempt to access a protected page or API ({path}) was detected."
        notification_service.create_notification(db, user_id, NotificationType.UNAUTHORIZED_ACCESS, title, message)
