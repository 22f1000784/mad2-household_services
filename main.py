from flask import Flask,render_template,url_for, request, jsonify
from config import config
from werkzeug.security import generate_password_hash
from models import User,Role,Service
from flask_restful import Api, marshal, fields
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


professional_fields = {
    'description':fields.String,
    'experience':fields.Integer

}

role_fields ={
    'name':fields.String,
    'description':fields.String
}

user_fields = {
    'id':fields.Integer,
    'name':fields.String,
    'age':fields.Integer,
    'phone':fields.Integer,
    "roles": fields.List(fields.Nested(role_fields)),
    'active':fields.Boolean,
    "professional": fields.Nested(professional_fields, allow_null=True)
}

service_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "price": fields.Integer,
    "time_required": fields.Integer,
    "Description":fields.String
}

@app.get('/all_services')
@auth_required('token')
@roles_required('admin')
def all_services():
    services = Service.query.all()
    if(len(services) == 0):
        return 'No service Found',404
    else:
        return marshal(services,service_fields),202

@app.get('/allusers')
@auth_required('token')
@roles_required('admin')
def allusers():
    users = User.query.all()
    if(len(users) == 0):
        return 'No user found',401
    else:
        return marshal(users,user_fields),200
    
@app.route('/update_service/<int:service_id>', methods = ['POST'])
@auth_required('token')
@roles_required('admin')
def update_services(service_id):
    
    try:
            # Fetch the service to update
            service = Service.query.filter_by(id = service_id).first()
            if not service:
                return jsonify({"error": "Service not found"}), 404

            # Parse the request JSON
            data = request.get_json()
            service.name = data.get("name", service.name)
            service.price = data.get("price", service.price)
            service.time_required = data.get("time_required", service.time_required)
            service.Description = data.get("Description", service.Description)

            # Commit changes to the database
            db.session.commit()
            return "Service updated successfully", 200

    except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/delete_service/<int:service_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_service(service_id):
    try:
        # Fetch the service to delete
        service = Service.query.get(service_id)
        if not service:
            return "Service not found", 404

        # Delete the service
        db.session.delete(service)
        db.session.commit()

        return "Service deleted successfully", 200

    except Exception as e:
        db.session.rollback()
        return str(e), 500

@app.route("/activate_user/<int:user_id>", methods=["POST"])
@auth_required('token')
@roles_required('admin')
def activate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.active = True
    db.session.commit()
    
    return jsonify({"message": "User activated", "active": user.active}), 200

@app.route("/deactivate_user/<int:user_id>", methods=["POST"])
@auth_required('token')
@roles_required('admin')
def deactivate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.active = False
    db.session.commit()
    
    return jsonify({"message": "User deactivated", "active": user.active}), 200





if __name__ == "__main__":
    
    app.run()
