from sqlalchemy import Date,func
from database import db
from flask_security import UserMixin,RoleMixin
from uuid import uuid4

user_roles = db.Table('user_roles', db.Model.metadata,
               db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
                db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True)
                )
class User(db.Model,UserMixin):
     __tablename__ = "user"
       
     id = db.Column(db.Integer, primary_key=True)
     email = db.Column(db.String(255), unique=True, nullable=False)
     password = db.Column(db.String(255), nullable=False)
     active = db.Column(db.Boolean, default=False)
     fs_uniquifier = db.Column(db.String(255),default = lambda:str(uuid4()), unique=True)
     roles = db.relationship('Role', secondary=user_roles, backref = 'users')
     name = db.Column(db.String(15))
     age = db.Column(db.Integer)
     phone = db.Column(db.Integer,nullable = True,unique = True)
     proffesional = db.relationship('Proffessional', uselist=False, back_populates='user',cascade = 'all,delete-orphan')
    
     def to_dict(self):
        return{"id":self.id,
                "name":self.name,
                "age":self.age,
                "email":self.email,
                "phone":self.phone,
                
                "password":self.password
                }
class Role(db.Model, RoleMixin):
        __tablename__ = 'role'
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(80), unique=True, nullable=False)
        description = db.Column(db.String(255))

class Proffessional(db.Model):
     __tablename__ = "proffesional"
     id = db.Column(db.Integer,primary_key = True)
     user_id = db.Column(db.ForeignKey("user.id",ondelete = 'CASCADE') )
     service_id = db.Column(db.Integer, db.ForeignKey("service.id", ondelete="CASCADE"))
     description =db.Column(db.Text,nullable = False )
     experience = db.Column(db.Integer)
     service = db.relationship("Service", back_populates="professionals")
     user = db.relationship("User",back_populates = 'proffesional')



class Service(db.Model):
     __tablename__ = "service"
     id = db.Column(db.Integer,primary_key = True)
     name = db.Column(db.String(100),nullable = False,unique = True)
     price = db.Column(db.Integer,nullable = False)
     time_required = db.Column(db.Integer())
     Description = db.Column(db.Text)
     professionals = db.relationship("Proffessional", back_populates="service", cascade="all, delete")

class Service_request(db.Model):
     __tablename__ = "service_request"
     id = db.Column(db.Integer,primary_key = True)
     service_id =db.Column(db.ForeignKey("service.id"))
     customer_id = db.Column(db.ForeignKey("user.id"))
     proffesional_id = db.Column(db.ForeignKey("proffesional.id"))
     date_of_request = db.Column(Date, default=func.now())
     date_of_completion = db.Column(Date)
     service_status = db.Column(db.String(100))
     remarks = db.Column(db.String(500))
     service = db.relationship("Service")
     customer = db.relationship("User")
     proffessional = db.relationship("Proffessional")

