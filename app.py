from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharmacy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dbms-project-secret-key'

# Initialize database
db = SQLAlchemy(app)

# Association tables for many-to-many relationships
doctor_patient = db.Table('doctor_patient',
    db.Column('doctor_id', db.String(10), db.ForeignKey('doctor.phys_id'), primary_key=True),
    db.Column('patient_id', db.String(10), db.ForeignKey('patient.pid'), primary_key=True)
)

drug_prescription = db.Table('drug_prescription',
    db.Column('prescription_id', db.Integer, primary_key=True),
    db.Column('doctor_id', db.String(10), db.ForeignKey('doctor.phys_id')),
    db.Column('drug_id', db.Integer, db.ForeignKey('drug.id')),
    db.Column('patient_id', db.String(10), db.ForeignKey('patient.pid')),
    db.Column('date', db.Date, default=datetime.now().date()),
    db.Column('quantity', db.Integer)
)

drug_sale = db.Table('drug_sale',
    db.Column('sale_id', db.Integer, primary_key=True),
    db.Column('drug_id', db.Integer, db.ForeignKey('drug.id')),
    db.Column('employee_id', db.String(10), db.ForeignKey('employee.employee_id')),
    db.Column('date', db.Date, default=datetime.now().date()),
    db.Column('quantity', db.Integer)
)

# Define models
class Patient(db.Model):
    pid = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sex = db.Column(db.String(10))
    address = db.Column(db.String(200))
    contact_no = db.Column(db.String(20))
    insurance_info = db.Column(db.Text)
    
    # Relationships
    doctors = db.relationship('Doctor', secondary=doctor_patient, backref='patients')

class Doctor(db.Model):
    phys_id = db.Column(db.String(10), primary_key=True)
    d_name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100))

class Drug(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trade_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    manufacturer_id = db.Column(db.String(10), db.ForeignKey('drug_manufacturer.company_id'))
    
    # Relationships
    manufacturer = db.relationship('DrugManufacturer', backref='drugs')

class DrugManufacturer(db.Model):
    company_id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    
    # Relationships
    contracts = db.relationship('Contract', backref='manufacturer')

class Employee(db.Model):
    employee_id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    shift_start = db.Column(db.Time)
    shift_end = db.Column(db.Time)
    pharmacy_id = db.Column(db.String(10), db.ForeignKey('pharmacy.pharm_id'))
    
    # Relationships
    pharmacy = db.relationship('Pharmacy', backref='employees')

class Pharmacy(db.Model):
    pharm_id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    fax = db.Column(db.String(20))
    
    # Relationships
    contracts = db.relationship('Contract', backref='pharmacy')

class Contract(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    manufacturer_id = db.Column(db.String(10), db.ForeignKey('drug_manufacturer.company_id'))
    pharmacy_id = db.Column(db.String(10), db.ForeignKey('pharmacy.pharm_id'))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# Patient routes
@app.route('/patients', methods=['GET'])
def list_patients():
    patients = Patient.query.all()
    return render_template('patients.html', patients=patients)

@app.route('/patients/add', methods=['POST'])
def add_patient():
    if request.method == 'POST':
        data = request.json
        
        patient = Patient(
            pid=data['pid'],
            name=data['name'],
            sex=data['sex'],
            address=data['address'],
            contact_no=data['contact_no'],
            insurance_info=data.get('insurance_info', '')
        )
        
        try:
            db.session.add(patient)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Patient added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/patients/edit/<pid>', methods=['PUT'])
def edit_patient(pid):
    patient = Patient.query.get_or_404(pid)
    data = request.json
    
    patient.name = data['name']
    patient.sex = data['sex']
    patient.address = data['address']
    patient.contact_no = data['contact_no']
    patient.insurance_info = data.get('insurance_info', '')
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Patient updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/patients/delete/<pid>', methods=['DELETE'])
def delete_patient(pid):
    patient = Patient.query.get_or_404(pid)
    
    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Patient deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/patients/api/all', methods=['GET'])
def api_all_patients():
    patients = Patient.query.all()
    result = []
    
    for patient in patients:
        result.append({
            'pid': patient.pid,
            'name': patient.name,
            'sex': patient.sex,
            'address': patient.address,
            'contact_no': patient.contact_no,
            'insurance_info': patient.insurance_info
        })
    
    return jsonify(result)

@app.route('/patients/api/<pid>', methods=['GET'])
def api_get_patient(pid):
    patient = Patient.query.get_or_404(pid)
    return jsonify({
        'pid': patient.pid,
        'name': patient.name,
        'sex': patient.sex,
        'address': patient.address,
        'contact_no': patient.contact_no,
        'insurance_info': patient.insurance_info
    })

# Doctor routes
@app.route('/doctors', methods=['GET'])
def list_doctors():
    doctors = Doctor.query.all()
    return render_template('doctors.html', doctors=doctors)

@app.route('/doctors/add', methods=['POST'])
def add_doctor():
    if request.method == 'POST':
        data = request.json
        
        doctor = Doctor(
            phys_id=data['phys_id'],
            d_name=data['d_name'],
            specialty=data['specialty']
        )
        
        try:
            db.session.add(doctor)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Doctor added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/doctors/edit/<phys_id>', methods=['PUT'])
def edit_doctor(phys_id):
    doctor = Doctor.query.get_or_404(phys_id)
    data = request.json
    
    doctor.d_name = data['d_name']
    doctor.specialty = data['specialty']
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Doctor updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/doctors/delete/<phys_id>', methods=['DELETE'])
def delete_doctor(phys_id):
    doctor = Doctor.query.get_or_404(phys_id)
    
    try:
        db.session.delete(doctor)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Doctor deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/doctors/api/all', methods=['GET'])
def api_all_doctors():
    doctors = Doctor.query.all()
    result = []
    
    for doctor in doctors:
        result.append({
            'phys_id': doctor.phys_id,
            'd_name': doctor.d_name,
            'specialty': doctor.specialty
        })
    
    return jsonify(result)

@app.route('/doctors/api/<phys_id>', methods=['GET'])
def api_get_doctor(phys_id):
    doctor = Doctor.query.get_or_404(phys_id)
    return jsonify({
        'phys_id': doctor.phys_id,
        'd_name': doctor.d_name,
        'specialty': doctor.specialty
    })

# Drug routes
@app.route('/drugs', methods=['GET'])
def list_drugs():
    drugs = Drug.query.all()
    manufacturers = DrugManufacturer.query.all()
    return render_template('drugs.html', drugs=drugs, manufacturers=manufacturers)

@app.route('/drugs/add', methods=['POST'])
def add_drug():
    if request.method == 'POST':
        data = request.json
        
        drug = Drug(
            trade_name=data['trade_name'],
            price=data['price'],
            quantity=data['quantity'],
            manufacturer_id=data['manufacturer_id']
        )
        
        try:
            db.session.add(drug)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Drug added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/drugs/edit/<int:id>', methods=['PUT'])
def edit_drug(id):
    drug = Drug.query.get_or_404(id)
    data = request.json
    
    drug.trade_name = data['trade_name']
    drug.price = data['price']
    drug.quantity = data['quantity']
    drug.manufacturer_id = data['manufacturer_id']
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Drug updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/drugs/delete/<int:id>', methods=['DELETE'])
def delete_drug(id):
    drug = Drug.query.get_or_404(id)
    
    try:
        db.session.delete(drug)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Drug deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/drugs/api/all', methods=['GET'])
def api_all_drugs():
    drugs = Drug.query.all()
    result = []
    
    for drug in drugs:
        manufacturer = DrugManufacturer.query.get(drug.manufacturer_id)
        result.append({
            'id': drug.id,
            'trade_name': drug.trade_name,
            'price': drug.price,
            'quantity': drug.quantity,
            'manufacturer_id': drug.manufacturer_id,
            'manufacturer_name': manufacturer.name if manufacturer else None
        })
    
    return jsonify(result)

@app.route('/drugs/api/<int:id>', methods=['GET'])
def api_get_drug(id):
    drug = Drug.query.get_or_404(id)
    manufacturer = DrugManufacturer.query.get(drug.manufacturer_id)
    return jsonify({
        'id': drug.id,
        'trade_name': drug.trade_name,
        'price': drug.price,
        'quantity': drug.quantity,
        'manufacturer_id': drug.manufacturer_id,
        'manufacturer_name': manufacturer.name if manufacturer else None
    })

# Manufacturer routes
@app.route('/manufacturers', methods=['GET'])
def list_manufacturers():
    manufacturers = DrugManufacturer.query.all()
    pharmacies = Pharmacy.query.all()
    contracts = Contract.query.all()
    return render_template('manufacturers.html', manufacturers=manufacturers, pharmacies=pharmacies, contracts=contracts)

@app.route('/manufacturers/add', methods=['POST'])
def add_manufacturer():
    if request.method == 'POST':
        data = request.json
        
        manufacturer = DrugManufacturer(
            company_id=data['company_id'],
            name=data['name'],
            address=data['address']
        )
        
        try:
            db.session.add(manufacturer)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Manufacturer added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/manufacturers/edit/<company_id>', methods=['PUT'])
def edit_manufacturer(company_id):
    manufacturer = DrugManufacturer.query.get_or_404(company_id)
    data = request.json
    
    manufacturer.name = data['name']
    manufacturer.address = data['address']
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Manufacturer updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/manufacturers/delete/<company_id>', methods=['DELETE'])
def delete_manufacturer(company_id):
    manufacturer = DrugManufacturer.query.get_or_404(company_id)
    
    try:
        db.session.delete(manufacturer)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Manufacturer deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/manufacturers/api/all', methods=['GET'])
def api_all_manufacturers():
    manufacturers = DrugManufacturer.query.all()
    result = []
    
    for manufacturer in manufacturers:
        result.append({
            'company_id': manufacturer.company_id,
            'name': manufacturer.name,
            'address': manufacturer.address
        })
    
    return jsonify(result)

@app.route('/manufacturers/api/<company_id>', methods=['GET'])
def api_get_manufacturer(company_id):
    manufacturer = DrugManufacturer.query.get_or_404(company_id)
    return jsonify({
        'company_id': manufacturer.company_id,
        'name': manufacturer.name,
        'address': manufacturer.address
    })

# Contract routes
@app.route('/contracts', methods=['GET'])
def list_contracts():
    contracts = Contract.query.all()
    return render_template('contracts.html', contracts=contracts)

@app.route('/contracts/add', methods=['POST'])
def add_contract():
    if request.method == 'POST':
        data = request.json
        
        contract = Contract(
            manufacturer_id=data['manufacturer_id'],
            pharmacy_id=data['pharmacy_id'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        )
        
        try:
            db.session.add(contract)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Contract added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/contracts/edit/<int:id>', methods=['PUT'])
def edit_contract(id):
    contract = Contract.query.get_or_404(id)
    data = request.json
    
    contract.manufacturer_id = data['manufacturer_id']
    contract.pharmacy_id = data['pharmacy_id']
    contract.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    contract.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Contract updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/contracts/delete/<int:id>', methods=['DELETE'])
def delete_contract(id):
    contract = Contract.query.get_or_404(id)
    
    try:
        db.session.delete(contract)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Contract deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/contracts/api/all', methods=['GET'])
def api_all_contracts():
    contracts = Contract.query.all()
    result = []
    
    for contract in contracts:
        manufacturer = DrugManufacturer.query.get(contract.manufacturer_id)
        pharmacy = Pharmacy.query.get(contract.pharmacy_id)
        result.append({
            'id': contract.id,
            'manufacturer_id': contract.manufacturer_id,
            'manufacturer_name': manufacturer.name if manufacturer else None,
            'pharmacy_id': contract.pharmacy_id,
            'pharmacy_name': pharmacy.name if pharmacy else None,
            'start_date': contract.start_date.strftime('%Y-%m-%d'),
            'end_date': contract.end_date.strftime('%Y-%m-%d')
        })
    
    return jsonify(result)

@app.route('/contracts/api/<int:id>', methods=['GET'])
def api_get_contract(id):
    contract = Contract.query.get_or_404(id)
    manufacturer = DrugManufacturer.query.get(contract.manufacturer_id)
    pharmacy = Pharmacy.query.get(contract.pharmacy_id)
    return jsonify({
        'id': contract.id,
        'manufacturer_id': contract.manufacturer_id,
        'manufacturer_name': manufacturer.name if manufacturer else None,
        'pharmacy_id': contract.pharmacy_id,
        'pharmacy_name': pharmacy.name if pharmacy else None,
        'start_date': contract.start_date.strftime('%Y-%m-%d'),
        'end_date': contract.end_date.strftime('%Y-%m-%d')
    })

# Employee routes
@app.route('/employees', methods=['GET'])
def list_employees():
    employees = Employee.query.all()
    pharmacies = Pharmacy.query.all()
    return render_template('employees.html', employees=employees, pharmacies=pharmacies)

@app.route('/employees/add', methods=['POST'])
def add_employee():
    if request.method == 'POST':
        data = request.json
        
        shift_start = datetime.strptime(data['shift_start'], '%H:%M').time()
        shift_end = datetime.strptime(data['shift_end'], '%H:%M').time()
        
        employee = Employee(
            employee_id=data['employee_id'],
            name=data['name'],
            shift_start=shift_start,
            shift_end=shift_end,
            pharmacy_id=data['pharmacy_id']
        )
        
        try:
            db.session.add(employee)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Employee added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/employees/edit/<employee_id>', methods=['PUT'])
def edit_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    data = request.json
    
    shift_start = datetime.strptime(data['shift_start'], '%H:%M').time()
    shift_end = datetime.strptime(data['shift_end'], '%H:%M').time()
    
    employee.name = data['name']
    employee.shift_start = shift_start
    employee.shift_end = shift_end
    employee.pharmacy_id = data['pharmacy_id']
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Employee updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/employees/delete/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    
    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Employee deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/employees/api/all', methods=['GET'])
def api_all_employees():
    employees = Employee.query.all()
    result = []
    
    for employee in employees:
        pharmacy = Pharmacy.query.get(employee.pharmacy_id)
        result.append({
            'employee_id': employee.employee_id,
            'name': employee.name,
            'shift_start': employee.shift_start.strftime('%H:%M') if employee.shift_start else None,
            'shift_end': employee.shift_end.strftime('%H:%M') if employee.shift_end else None,
            'pharmacy_id': employee.pharmacy_id,
            'pharmacy_name': pharmacy.name if pharmacy else None
        })
    
    return jsonify(result)

@app.route('/employees/api/<employee_id>', methods=['GET'])
def api_get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    pharmacy = Pharmacy.query.get(employee.pharmacy_id)
    return jsonify({
        'employee_id': employee.employee_id,
        'name': employee.name,
        'shift_start': employee.shift_start.strftime('%H:%M') if employee.shift_start else None,
        'shift_end': employee.shift_end.strftime('%H:%M') if employee.shift_end else None,
        'pharmacy_id': employee.pharmacy_id,
        'pharmacy_name': pharmacy.name if pharmacy else None
    })

# Pharmacy routes
@app.route('/pharmacies', methods=['GET'])
def list_pharmacies():
    pharmacies = Pharmacy.query.all()
    return render_template('pharmacies.html', pharmacies=pharmacies)

@app.route('/pharmacies/add', methods=['POST'])
def add_pharmacy():
    if request.method == 'POST':
        data = request.json
        
        pharmacy = Pharmacy(
            pharm_id=data['pharm_id'],
            name=data['name'],
            address=data['address'],
            fax=data['fax']
        )
        
        try:
            db.session.add(pharmacy)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Pharmacy added successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/pharmacies/edit/<pharm_id>', methods=['PUT'])
def edit_pharmacy(pharm_id):
    pharmacy = Pharmacy.query.get_or_404(pharm_id)
    data = request.json
    
    pharmacy.name = data['name']
    pharmacy.address = data['address']
    pharmacy.fax = data['fax']
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Pharmacy updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/pharmacies/delete/<pharm_id>', methods=['DELETE'])
def delete_pharmacy(pharm_id):
    pharmacy = Pharmacy.query.get_or_404(pharm_id)
    
    try:
        db.session.delete(pharmacy)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Pharmacy deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/pharmacies/api/all', methods=['GET'])
def api_all_pharmacies():
    pharmacies = Pharmacy.query.all()
    result = []
    
    for pharmacy in pharmacies:
        result.append({
            'pharm_id': pharmacy.pharm_id,
            'name': pharmacy.name,
            'address': pharmacy.address,
            'fax': pharmacy.fax
        })
    
    return jsonify(result)

@app.route('/pharmacies/api/<pharm_id>', methods=['GET'])
def api_get_pharmacy(pharm_id):
    pharmacy = Pharmacy.query.get_or_404(pharm_id)
    return jsonify({
        'pharm_id': pharmacy.pharm_id,
        'name': pharmacy.name,
        'address': pharmacy.address,
        'fax': pharmacy.fax
    })

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    app.run(debug=True)