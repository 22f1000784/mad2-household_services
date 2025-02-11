from flask import Flask,render_template,url_for
from config import config
from werkzeug.security import generate_password_hash
from models import User,Role
from flask_restful import Api
from resources import UserResource,Customer,service,userlogin
from flask_security import Security,SQLAlchemyUserDatastore,auth_required,roles_required
from database import db
#rint(app.config['SQLALCHEMY_DATABASE_URI'])
from config import datastore

app = Flask(__name__)
api = Api(app)


app.config.from_object(config)
print(app.config['SQLALCHEMY_DATABASE_URI'])
db.init_app(app)  
app.security = Security(app,datastore)
app.app_context().push()

print(app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'])

api.add_resource(UserResource,'/user/<int:user_id>')
api.add_resource(Customer,'/customer/registration',endpoint = "customer_registration")
api.add_resource(Customer,'/customer/<int:customer_id>', endpoint = "customer_get")
api.add_resource(service,'/service/creation',endpoint = 'service_creation')
api.add_resource(service,'/service/<int:service_id>',endpoint = "service_get")
api.add_resource(userlogin,'/user-login',endpoint ='login')
with app.app_context():
    db.create_all()
    if not db.session.query(Role).filter_by(id = 1).first():
        role =Role(name = 'admin',description = "user is an admin")
        role2 = Role(name = 'customer',description = "user is a customer")
        role3 = Role(name = 'professional',description = "user is a proffesional")
        db.session.add(role2)
        db.session.add(role3)
        db.session.add(role)
        db.session.commit()
    
        datastore.create_user(email ='admin@email.com',password = generate_password_hash('admin'),active = True,name = 'Ayush',age = 26,phone = 9523601472,roles = [role])
        
        db.session.commit()
       

@app.route('/admin')
@roles_required('admin')
@auth_required("token")  
def admin():
     return ({"message":"welcome fromadmin"}),200


@app.route('/')
def home():
    return render_template("index.html")

if __name__ == "__main__":
    
    app.run()
