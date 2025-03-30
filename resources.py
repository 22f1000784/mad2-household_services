from flask_restful import Resource,reqparse
from config import datastore
from sqlalchemy import select
from flask import jsonify,json,request,Response
from models import *
from database import db
from flask_security import roles_required, auth_required,current_user
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from instances import cache
class userlogin(Resource):
     def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        print(user)
        try:
             if(user and check_password_hash(user.password,data.get('password'))):
                 print(user.get_auth_token())
                 print(user.roles)
                 print(user.roles[0].name)
                 role = user.roles[0].name
                 return {'authentication_token':user.get_auth_token(),"role":role},200
             else:
                 print('inside wrong email password block')
                 return {'message':'Wrong email or password'}, 401
             
        except Exception as e:
             print('inside exception block')
             return {'message':e},404
class UserResource(Resource):
    def get(self,user_id):
        user = db.session.get(User, user_id)
        user_data = user.to_dict()
        return jsonify(user_data)

class Customer(Resource):
    def post(self):
       # parser = reqparse.RequestParser()
        #args = parser.parse_args()
       # parser.add_argument('customer_name', type=str, required=True, help="Customer name is required")
        args = request.get_json()
        name = args['customer_name']
        age = args['customer_age']
        email = args['customer_email']
        phone = args['customer_phone']
        password = args['customer_password']
        customer_role = args['customer_role']
        
        role = Role.query.filter_by(name = customer_role).first()
        print(role)
        user = datastore.create_user(name = name,age = age, email = email,phone = phone,active = False, password = generate_password_hash(password),roles= [role])
        db.session.add(user)
        db.session.commit()
        try:
            
            
            if user.roles[0] == 'professional':
                try:
                    service_name = args['service']
                    print(service_name)
                    service = Service.query.filter_by(id = service_name).first()
                    print(service)
                    
                    description = args['description']
                    experience = args['experience']
                    new_proffessional = Proffessional(description = description, experience = experience,user = user,service_id = service.id) 
                    db.session.add(new_proffessional)
                    db.session.commit()
                    return jsonify({"message":" proffesional is created"})
                except Exception as e:
                    db.session.rollback()
                    message = json.dumps({"error":str(e)})
                    resp = Response(message,status = 500,mimetype = 'application/json')
                    return resp

            user_data =  user.to_dict()
            message = json.dumps({"result": "updated"})
            resp = Response(message, status=201, mimetype='application/json')
            return resp
        
        except Exception as e:
            db.session.rollback()
            message = json.dumps({"error":str(e)})
            resp = Response(message,status = 500, mimetype = 'application/json')
            return resp
    def get(self,customer_id):
        customer = db.session.get(User, customer_id)
        if(customer and customer.role == 'customer'):
            
            user = customer.to_dict()
            message = json.dumps(user)
            resp = Response(message, status =  200,mimetype = 'application/json')
            return resp
        else:
            message = json.dumps({"message":"Please enter a valid user id"})
            resp = Response(message, status = 200, mimetype = 'application/json')
            return resp

class service(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type = str, required = True, help = 'Name cannot be blank')
        parser.add_argument('price', type = int, required = True, help = 'price cannot be blank')
        parser.add_argument('time_required', type = str, required = True, help = 'time required cannot be blank')
        parser.add_argument('description', type = str, required = True, help = 'description can\'t be blant')

        args = parser.parse_args()
        name = args['name']
        price = args['price']
        time = args['time_required']
        description = args['description']
        service = Service(name = name, price = price, time_required = time, Description = description)
        try:
            db.session.add(service)
            db.session.commit()
        except Exception as e:

            db.session.rollback()
            message = json.dumps({"error":str(e)})
            resp = Response(message,status = 200, mimetype = 'application/json')
            return resp
    @cache.cached(timeout=50)    
    def get(self,service_id):


        service = db.session.get(Service,service_id)
        if service:
            message = json.dumps({"id":service.id,"name":service.name,"time_requires":service.time_required,"Description":service.Description})
            resp = Response(message,status = 200,mimetype='application/json')
            return resp
        else:
            return ({"error":"invalid service id"}),200


class ServiceRequestAPI(Resource):
    @auth_required('token')
    def post(self, proffesional_id):
        try:
            # Fetch professional details using ID from URL
            proffesional = Proffessional.query.filter_by(id = proffesional_id).first()
            if not proffesional:
                return jsonify({"error": "Invalid proffesional ID"}), 404

            # Fetch associated service ID
            service_id = proffesional.service.id if proffesional.service else None
            if not service_id:
                return jsonify({"error": "Proffesional does not have an associated service"}), 404

            # Fetch customer ID from authenticated user
            customer_id = current_user.id

            # Extract remarks from request body (optional)
            data = request.get_json()
            remarks = data.get("remarks", "")

            # Create a new service request
            new_request = Service_request(
                service_id=service_id,
                customer_id=customer_id,
                proffesional_id=proffesional_id,
                date_of_request=datetime.utcnow(),
                service_status="Pending",
                remarks=remarks
            )

            db.session.add(new_request)
            db.session.commit()

            message = json.dumps({"message": "Service request created successfully!"})
            return Response(message, status=201, mimetype='application/json')

        

        except Exception as e:
            db.session.rollback()
            message = json.dumps({"error": str(e)})
            return Response(message, status=500, mimetype='application/json')

class AcceptServiceRequest(Resource):
    @auth_required("token")  # Ensure authentication
    def post(self, request_id):
        # Fetch the service request
        service_request = Service_request.query.get(request_id)
        
        if not service_request:
            return ({"message": "Service request not found"}), 404

        # Ensure the logged-in user is the assigned professional
        if service_request.proffesional_id != current_user.proffesional.id:
            return ({"message": "Unauthorized access"}), 403
        
        # Update service request status to "accepted"
        service_request.service_status = "accepted"
        db.session.commit()

        return ({"message": "Service request accepted successfully"}), 200

class RejectServiceRequest(Resource):
    @auth_required("token")  # Ensure authentication
    def post(self, request_id):
        # Fetch the service request
        service_request = Service_request.query.get(request_id)
        
        if not service_request:
            return ({"message": "Service request not found"}), 404

        # Ensure the logged-in user is the assigned professional
        if service_request.proffesional_id != current_user.proffesional.id:
            return ({"message": "Unauthorized access"}), 403
        
        # Update service request status to "accepted"
        service_request.service_status = "rejected"
        db.session.commit()

        return ({"message": "Service request accepted successfully"}), 200

