from flask import Flask, make_response, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restful import Resource, Api
from models import User, Patch, Oscillator
from database import db
from pprint import pprint

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/new-synthia'
app.secret_key = b'\xfc\xceRXDr\t]3\xed\x0f\x8e\xadg\xcb<'

migrate = Migrate(app, db)
api = Api(app)

db.init_app(app)

class Login(Resource):
    def post(self):
        name = request.get_json()['name']
        user = User.query.filter(User.name == name).first()
        
        session['user_id'] = user.id
        print(session['user_id'])

        # if user is None:
        #     user = User(name=request.json['name'])
        #     db.session.add(user)
        #     db.session.commit()
            
        return user.to_dict(), 201

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        print(session.get('user_id'))
        if user_id:
            print("found a user")
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200
        else:
            return {'message': '401: Not Authorized'}, 401


@app.route('/')
def hello():
    return "Hello, World!"


@app.get('/users')
def index_users():
    users = User.query.order_by(User.id).all()
    user_dicts = [user.to_dict() for user in users]
    
    return make_response(jsonify(user_dicts), 200)


@app.get('/users/<int:id>')
def show_user(id):
    user = User.query.get(id)

    return make_response(jsonify(user.to_dict()), 200)


@app.get('/oscillators')
def index_oscillators():
    oscillators = Oscillator.query.order_by(Oscillator.id).all()
    osc_dicts = [osc.to_dict() for osc in oscillators]

    return make_response(jsonify(osc_dicts), 200)


@app.get('/patches')
def index_patches():
    patches = Patch.query.order_by(Patch.id).all()
    patch_dicts = [patch.to_dict() for patch in patches]

    return make_response(jsonify(patch_dicts), 200)


@app.post('/patches')
def add_patch():
    data = request.get_json()

    patch = Patch()
    patch_oscillators = []

    for osc in data['oscillators']:
        new_osc = Oscillator(
            osc_type = osc['osc_type'],
            gain = osc['gain'],
            attack = osc['attack'],
            decay = osc['decay'],
            sustain = osc['sustain'],
            release = osc['release']
        )
        print(osc)
        patch_oscillators.append(new_osc)

    patch.name = data['name']
    patch.oscillators = patch_oscillators
    patch.user = data['creator']

    db.session.add(patch)
    db.session.commit()

    return make_response(jsonify({"message": "new patch created"}), 200)


@app.patch('/patches/<int:id>')
def update_patch(id):
    patch = Patch.query.get(id)

    if patch is None:
        return jsonify({"message": "Patch not found"}), 404

    data = request.get_json()

    if 'name' in data:
        patch.name = data['name']
    
    if 'oscillators' in data:
        for patchOsc in patch.oscillators:
            for dataOsc in data['oscillators']:
                if patchOsc.number == dataOsc['number']:
                    patchOsc.osc_type = dataOsc['osc_type']
                    patchOsc.gain = dataOsc['gain']
                    patchOsc.attack = dataOsc['attack']
                    patchOsc.decay = dataOsc['decay']
                    patchOsc.sustain = dataOsc['sustain']
                    patchOsc.release = dataOsc['release']
                
    db.session.add(patch)
    db.session.commit()

    return jsonify({"message": f"Patch updated successfully"}), 200

api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')


if __name__ == '__main__':
    app.run(port=5555, debug=True)