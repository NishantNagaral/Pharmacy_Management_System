from app import db
from datetime import datetime

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