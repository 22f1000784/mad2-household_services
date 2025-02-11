from flask_restful import Resource,reqparse
from config import datastore
from sqlalchemy import select
from flask import jsonify,json,request,Response
from models import *
from database import db
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
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
        customer_status = args['customer_status']
        role = Role.query.filter_by(name = customer_role).first()
        print(role)
        user = datastore.create_user(name = name,age = age, email = email,phone = phone, password = generate_password_hash(password),active = customer_status,roles= [role])
        try:
            db.session.add(user)
            db.session.commit()
            
            if user.roles[0] == 'professional':
                try:
                    description = args['description']
                    experience = args['experience']
                    new_proffessional = Proffessional(description = description, experience = experience,user = user) 
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
        
    def get(self,service_id):


        service = db.session.get(Service,service_id)
        if service:
            message = json.dumps({"id":service.id,"name":service.name,"time_requires":service.time_required,"Description":service.Description})
            resp = Response(message,status = 200,mimetype='application/json')
            return resp
        else:
            return ({"error":"invalid service id"}),200







