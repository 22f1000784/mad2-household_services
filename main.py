from flask import Flask,render_template,url_for, request, jsonify,Response,json, send_file
from config import config
from werkzeug.security import generate_password_hash
from models import User,Role,Service,Service_request,Proffessional
from flask_restful import Api, marshal, fields
from resources import UserResource,Customer,service,userlogin,ServiceRequestAPI,AcceptServiceRequest,RejectServiceRequest
from flask_security import Security,SQLAlchemyUserDatastore,auth_required,roles_required,roles_accepted,current_user
from database import db
import os
import time
from instances import cache
from celery.schedules import crontab,timedelta
from worker import celery_init_app

from task import send_reminder_emails,send_monthly_report,send_test_report,generate_csv

#rint(app.config['SQLALCHEMY_DATABASE_URI'])
from config import datastore

app = Flask(__name__)
api = Api(app)


app.config.from_object(config)
print(app.config['SQLALCHEMY_DATABASE_URI'])

db.init_app(app)



 
app.security = Security(app,datastore)
app.app_context().push()
celery_app = celery_init_app(app)
cache.init_app(app)

cache.set("test_key", "cached_value", timeout=10)
print(cache.get("test_key")) 
print(app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'])

api.add_resource(UserResource,'/user/<int:user_id>')
api.add_resource(Customer,'/customer/registration',endpoint = "customer_registration")
api.add_resource(Customer,'/customer/<int:customer_id>', endpoint = "customer_get")
api.add_resource(service,'/service/creation',endpoint = 'service_creation')
api.add_resource(service,'/service/<int:service_id>',endpoint = "service_get")
api.add_resource(userlogin,'/user-login',endpoint ='login')
api.add_resource(ServiceRequestAPI, '/service-request/<int:proffesional_id>', endpoint='service_request')
api.add_resource(AcceptServiceRequest, "/accept_request/<int:request_id>")
api.add_resource(RejectServiceRequest, "/reject_request/<int:request_id>")


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

@app.route('/test-cache')
@cache.cached(timeout=30)  # Cache for 10 seconds
def test_cache():
    cached_data = cache.get("/test-cache")  
    if cached_data:
        print("🚀 Returning cached response!")  # Should print when cache works
    else:
        print("⚠️ Generating fresh response...")  # Should print only once every 10 sec
    return f"Response at {time.time()}"



@app.route('/download-report', methods=['GET'])
def download_report():
    """Trigger report generation & send it to admin in one click."""
    task = generate_csv.apply_async()  # Start Celery task
    file_path = task.get(timeout=30)   # Wait for task to complete (max 30 sec)

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "Report generation failed!"}), 500

    return send_file(file_path, as_attachment=True)


@celery_app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=0, hour=0, day_of_month=1), 
        send_reminder_emails.s(),
    )

    sender.add_periodic_task(
        crontab(hour=00, minute=35),  # Runs at 00:00 on the 1st of every month
        send_monthly_report.s(day_of_month=1, hour=0, minute=0),
    )
       
@app.route('/trigger-report', methods=['GET'])
@cache.cached(timeout=50)
def trigger_report():
    """API to manually trigger the monthly report generation."""
    task = send_monthly_report.delay()  # Call Celery task asynchronously
    return jsonify({"message": "Report generation started!", "task_id": task.id}), 202

@app.route('/admin')
@roles_required('admin')
@auth_required("token")  
def admin():
     return ({"message":"welcome fromadmin"}),200


@app.route('/')
def home():
    return render_template("index.html")




role_fields ={
    'name':fields.String,
    'description':fields.String
}
service_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "price": fields.Integer,
    "time_required": fields.Integer,
    "Description":fields.String
}

proffesional_fields = {
    'id':fields.Integer,
    'description':fields.String,
    'experience':fields.Integer,
    'service': fields.Nested(service_fields, allow_null=True)

}

user_fields = {
    'id':fields.Integer,
    'name':fields.String,
    'age':fields.Integer,
    'phone':fields.Integer,
    "roles": fields.List(fields.Nested(role_fields)),
    'active':fields.Boolean,
    "proffesional": fields.Nested(proffesional_fields, allow_null=True)
}

service_request_fields = {
    "id": fields.Integer,
    "service_id": fields.Integer,
    "customer_id": fields.Integer,
    "proffesional_id": fields.Integer,
    "date_of_request": fields.String,
    "date_of_completion": fields.String,
    "service_status": fields.String,
    "remarks": fields.String,
    "service": fields.Nested(service_fields),
    "customer": fields.Nested(user_fields),
    "proffessional": fields.Nested(proffesional_fields)
}


@app.get('/proffesional/service-requests')
@auth_required('token')
@roles_required('professional')
@cache.cached(timeout=50)
def get_proffesional_requests():
    # Fetch professional ID from current_user
    proffesional = Proffessional.query.filter_by(id=current_user.proffesional.id).first()

    if not proffesional:
        return Response(json.dumps({"message": "Professional profile not found"}), status=404, mimetype='application/json')

    # Fetch service requests for the professional
    service_requests = Service_request.query.filter_by(proffesional_id=proffesional.id).all()

    if not service_requests:
        return Response(json.dumps({"message": "No service requests found"}), status=404, mimetype='application/json')

    return Response(json.dumps(marshal(service_requests, service_request_fields)), status=200, mimetype='application/json')


@app.route('/close_request/<int:request_id>', methods=['POST'])
@auth_required('token')
@roles_required('customer')
def close_request(request_id):
    data = request.get_json()
    remarks = data.get("remarks")

    if not remarks:
        return jsonify({"error": "Remarks required"}), 400

    service_request = Service_request.query.filter_by(id = request_id).first()
    if not service_request:
        return jsonify({"error": "Service request not found"}), 404

    service_request.service_status = "completed"
    service_request.remarks = remarks
    db.session.add(service_request)
    db.session.commit()

    return jsonify({"message": "Service request closed successfully"}), 200


@app.get('/all_service_requests')
@auth_required('token')
@roles_accepted('admin','customer')
@cache.cached(timeout=50)
def all_service_requests():
    service_requests = Service_request.query.all()
    if len(service_requests) == 0:
        message = json.dumps({"message": "No service request found"})
        resp = Response(message, status=404, mimetype='application/json')
        return resp
    else:
        if(current_user.roles[0].name == 'customer'):
            service_requests = Service_request.query.filter_by(customer_id = current_user.id).all()
            return marshal(service_requests, service_request_fields), 202
    


@app.route("/api/services", methods=["GET"])
def get_services():
    """API endpoint to fetch all service names."""
    try:
            services = Service.query.with_entities(Service.id, Service.name).all()
            service_list = [{"id": service.id, "name": service.name} for service in services]
            return jsonify(service_list),202
    except:
            return "something went wrong",404

@app.get('/all_services')
@auth_required('token')
@roles_required('admin')
@cache.cached(timeout=50)
def all_services():
    services = Service.query.all()
    if(len(services) == 0):
        return 'No service Found',404
    else:
        return marshal(services,service_fields),202

@app.get('/allusers')
@auth_required('token')
@roles_accepted('customer', 'admin')
@cache.cached(timeout=50)
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
