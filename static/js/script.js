document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    loadDoctors();
    loadDrugs();
    loadManufacturers();
    loadEmployees();
    loadPharmacies();
    loadContracts();
    populateManufacturerDropdown(); // For drugs page
    populatePharmacyDropdown(); // For employees page
    populateContractDropdowns(); // For contracts page

    // Patient form submission
    document.getElementById('patientForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const pid = document.getElementById('patientEditId').value;
        if (pid) {
            updatePatient(pid);
        } else {
            savePatient();
        }
    });

    // Doctor form submission
    document.getElementById('doctorForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const phys_id = document.getElementById('doctorEditId').value;
        if (phys_id) {
            updateDoctor(phys_id);
        } else {
            saveDoctor();
        }
    });

    // Drug form submission
    document.getElementById('drugForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('drugEditId').value;
        if (id) {
            updateDrug(id);
        } else {
            saveDrug();
        }
    });

    // Manufacturer form submission
    document.getElementById('manufacturerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const company_id = document.getElementById('manufacturerEditId').value;
        if (company_id) {
            updateManufacturer(company_id);
        } else {
            saveManufacturer();
        }
    });

    // Contract form submission
    document.getElementById('contractForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('contractEditId').value;
        if (id) {
            updateContract(id);
        } else {
            saveContract();
        }
    });

    // Employee form submission
    document.getElementById('employeeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const employee_id = document.getElementById('employeeEditId').value;
        if (employee_id) {
            updateEmployee(employee_id);
        } else {
            saveEmployee();
        }
    });

    // Pharmacy form submission
    document.getElementById('pharmacyForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const pharm_id = document.getElementById('pharmacyEditId').value;
        if (pharm_id) {
            updatePharmacy(pharm_id);
        } else {
            savePharmacy();
        }
    });
});

// Generic HTTP request functions
function postData(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function putData(url, data) {
    return fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function deleteData(url) {
    return fetch(url, {
        method: 'DELETE'
    }).then(response => response.json());
}

// Populate manufacturer dropdown for drugs page
function populateManufacturerDropdown() {
    const manufacturerSelect = document.getElementById('manufacturerId');
    if (!manufacturerSelect) return;

    fetch('/manufacturers/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch manufacturers');
            }
            return response.json();
        })
        .then(data => {
            manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
            data.forEach(manufacturer => {
                const option = document.createElement('option');
                option.value = manufacturer.company_id;
                option.textContent = manufacturer.name;
                manufacturerSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading manufacturers for dropdown:', error);
            showAlert('Failed to load manufacturers', 'danger');
        });
}

// Populate pharmacy dropdown for employees page
function populatePharmacyDropdown() {
    const pharmacySelect = document.getElementById('employeePharmacy');
    if (!pharmacySelect) return;

    fetch('/pharmacies/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch pharmacies');
            }
            return response.json();
        })
        .then(data => {
            pharmacySelect.innerHTML = '<option value="">Select Pharmacy</option>';
            data.forEach(pharmacy => {
                const option = document.createElement('option');
                option.value = pharmacy.pharm_id;
                option.textContent = pharmacy.name;
                pharmacySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading pharmacies for dropdown:', error);
            showAlert('Failed to load pharmacies', 'danger');
        });
}

// Populate manufacturer and pharmacy dropdowns for contracts page
function populateContractDropdowns() {
    const manufacturerSelect = document.getElementById('contractManufacturer');
    const pharmacySelect = document.getElementById('contractPharmacy');
    if (!manufacturerSelect || !pharmacySelect) return;

    // Populate manufacturers
    fetch('/manufacturers/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch manufacturers');
            }
            return response.json();
        })
        .then(data => {
            manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
            data.forEach(manufacturer => {
                const option = document.createElement('option');
                option.value = manufacturer.company_id;
                option.textContent = manufacturer.name;
                manufacturerSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading manufacturers for dropdown:', error);
            showAlert('Failed to load manufacturers', 'danger');
        });

    // Populate pharmacies
    fetch('/pharmacies/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch pharmacies');
            }
            return response.json();
        })
        .then(data => {
            pharmacySelect.innerHTML = '<option value="">Select Pharmacy</option>';
            data.forEach(pharmacy => {
                const option = document.createElement('option');
                option.value = pharmacy.pharm_id;
                option.textContent = pharmacy.name;
                pharmacySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading pharmacies for dropdown:', error);
            showAlert('Failed to load pharmacies', 'danger');
        });
}

// Patient Management Functions
function loadPatients() {
    fetch('/patients/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            return response.json();
        })
        .then(data => updateTable('patientTableBody', data, ['pid', 'name', 'sex', 'contact_no', 'address', 'insurance_info']))
        .catch(error => {
            console.error('Error loading patients:', error);
            showAlert('Failed to load patients', 'danger');
        });
}

function savePatient() {
    const patientData = {
        pid: document.getElementById('patientId').value,
        name: document.getElementById('patientName').value,
        sex: document.getElementById('patientSex').value,
        address: document.getElementById('patientAddress').value,
        contact_no: document.getElementById('patientContact').value,
        insurance_info: document.getElementById('patientInsurance').value
    };

    if (!patientData.pid || !patientData.name || !patientData.sex || !patientData.address || !patientData.contact_no) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/patients/add', patientData)
        .then(data => {
            if (data.success) {
                document.getElementById('patientForm').reset();
                document.getElementById('patientEditId').value = '';
                loadPatients();
                showAlert('Patient added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding patient:', error);
            showAlert('Failed to add patient', 'danger');
        });
}

function updatePatient(pid) {
    const patientData = {
        pid: document.getElementById('patientId').value,
        name: document.getElementById('patientName').value,
        sex: document.getElementById('patientSex').value,
        address: document.getElementById('patientAddress').value,
        contact_no: document.getElementById('patientContact').value,
        insurance_info: document.getElementById('patientInsurance').value
    };

    putData(`/patients/edit/${pid}`, patientData)
        .then(data => {
            if (data.success) {
                document.getElementById('patientForm').reset();
                document.getElementById('patientEditId').value = '';
                loadPatients();
                showAlert('Patient updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating patient:', error);
            showAlert('Failed to update patient', 'danger');
        });
}

function editPatient(pid) {
    fetch(`/patients/api/${pid}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch patient');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('patientEditId').value = data.pid;
            document.getElementById('patientId').value = data.pid;
            document.getElementById('patientName').value = data.name;
            document.getElementById('patientSex').value = data.sex;
            document.getElementById('patientContact').value = data.contact_no;
            document.getElementById('patientAddress').value = data.address;
            document.getElementById('patientInsurance').value = data.insurance_info || '';
        })
        .catch(error => {
            console.error('Error fetching patient:', error);
            showAlert('Failed to load patient data', 'danger');
        });
}

function deletePatient(pid) {
    if (confirm('Are you sure?')) {
        deleteData(`/patients/delete/${pid}`)
            .then(data => {
                if (data.success) {
                    loadPatients();
                    showAlert('Patient deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting patient:', error);
                showAlert('Failed to delete patient', 'danger');
            });
    }
}

// Doctor Management Functions
function loadDoctors() {
    fetch('/doctors/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            return response.json();
        })
        .then(data => updateTable('doctorTableBody', data, ['phys_id', 'd_name', 'specialty']))
        .catch(error => {
            console.error('Error loading doctors:', error);
            showAlert('Failed to load doctors', 'danger');
        });
}

function saveDoctor() {
    const doctorData = {
        phys_id: document.getElementById('physicianId').value,
        d_name: document.getElementById('doctorName').value,
        specialty: document.getElementById('specialty').value
    };

    if (!doctorData.phys_id || !doctorData.d_name || !doctorData.specialty) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/doctors/add', doctorData)
        .then(data => {
            if (data.success) {
                document.getElementById('doctorForm').reset();
                document.getElementById('doctorEditId').value = '';
                loadDoctors();
                showAlert('Doctor added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding doctor:', error);
            showAlert('Failed to add doctor', 'danger');
        });
}

function updateDoctor(phys_id) {
    const doctorData = {
        phys_id: document.getElementById('physicianId').value,
        d_name: document.getElementById('doctorName').value,
        specialty: document.getElementById('specialty').value
    };

    putData(`/doctors/edit/${phys_id}`, doctorData)
        .then(data => {
            if (data.success) {
                document.getElementById('doctorForm').reset();
                document.getElementById('doctorEditId').value = '';
                loadDoctors();
                showAlert('Doctor updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating doctor:', error);
            showAlert('Failed to update doctor', 'danger');
        });
}

function editDoctor(phys_id) {
    fetch(`/doctors/api/${phys_id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch doctor');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('doctorEditId').value = data.phys_id;
            document.getElementById('physicianId').value = data.phys_id;
            document.getElementById('doctorName').value = data.d_name;
            document.getElementById('specialty').value = data.specialty;
        })
        .catch(error => {
            console.error('Error fetching doctor:', error);
            showAlert('Failed to load doctor data', 'danger');
        });
}

function deleteDoctor(phys_id) {
    if (confirm('Are you sure?')) {
        deleteData(`/doctors/delete/${phys_id}`)
            .then(data => {
                if (data.success) {
                    loadDoctors();
                    showAlert('Doctor deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting doctor:', error);
                showAlert('Failed to delete doctor', 'danger');
            });
    }
}

// Drug Management Functions
function loadDrugs() {
    fetch('/drugs/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drugs');
            }
            return response.json();
        })
        .then(data => updateTable('drugTableBody', data, ['id', 'trade_name', 'price', 'quantity', 'manufacturer_name']))
        .catch(error => {
            console.error('Error loading drugs:', error);
            showAlert('Failed to load drugs', 'danger');
        });
}

function saveDrug() {
    const drugData = {
        trade_name: document.getElementById('tradeName').value,
        price: parseFloat(document.getElementById('drugPrice').value),
        quantity: parseInt(document.getElementById('quantity').value),
        manufacturer_id: document.getElementById('manufacturerId').value
    };

    if (!drugData.trade_name || isNaN(drugData.price) || isNaN(drugData.quantity) || !drugData.manufacturer_id) {
        showAlert('Please fill all required fields with valid values', 'danger');
        return;
    }

    postData('/drugs/add', drugData)
        .then(data => {
            if (data.success) {
                document.getElementById('drugForm').reset();
                document.getElementById('drugEditId').value = '';
                loadDrugs();
                showAlert('Drug added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding drug:', error);
            showAlert('Failed to add drug', 'danger');
        });
}

function updateDrug(id) {
    const drugData = {
        trade_name: document.getElementById('tradeName').value,
        price: parseFloat(document.getElementById('drugPrice').value),
        quantity: parseInt(document.getElementById('quantity').value),
        manufacturer_id: document.getElementById('manufacturerId').value
    };

    if (!drugData.trade_name || isNaN(drugData.price) || isNaN(drugData.quantity) || !drugData.manufacturer_id) {
        showAlert('Please fill all required fields with valid values', 'danger');
        return;
    }

    putData(`/drugs/edit/${id}`, drugData)
        .then(data => {
            if (data.success) {
                document.getElementById('drugForm').reset();
                document.getElementById('drugEditId').value = '';
                loadDrugs();
                showAlert('Drug updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating drug:', error);
            showAlert('Failed to update drug', 'danger');
        });
}

function editDrug(id) {
    fetch(`/drugs/api/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drug');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('drugEditId').value = data.id;
            document.getElementById('tradeName').value = data.trade_name;
            document.getElementById('drugPrice').value = data.price;
            document.getElementById('quantity').value = data.quantity;
            document.getElementById('manufacturerId').value = data.manufacturer_id;
        })
        .catch(error => {
            console.error('Error fetching drug:', error);
            showAlert('Failed to load drug data', 'danger');
        });
}

function deleteDrug(id) {
    if (confirm('Are you sure?')) {
        deleteData(`/drugs/delete/${id}`)
            .then(data => {
                if (data.success) {
                    loadDrugs();
                    showAlert('Drug deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting drug:', error);
                showAlert('Failed to delete drug', 'danger');
            });
    }
}

// Manufacturer Management Functions
function loadManufacturers() {
    fetch('/manufacturers/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch manufacturers');
            }
            return response.json();
        })
        .then(data => updateTable('manufacturerTableBody', data, ['company_id', 'name', 'address']))
        .catch(error => {
            console.error('Error loading manufacturers:', error);
            showAlert('Failed to load manufacturers', 'danger');
        });
}

function saveManufacturer() {
    const manufacturerData = {
        company_id: document.getElementById('companyId').value,
        name: document.getElementById('manufacturerName').value,
        address: document.getElementById('manufacturerAddress').value
    };

    if (!manufacturerData.company_id || !manufacturerData.name || !manufacturerData.address) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/manufacturers/add', manufacturerData)
        .then(data => {
            if (data.success) {
                document.getElementById('manufacturerForm').reset();
                document.getElementById('manufacturerEditId').value = '';
                loadManufacturers();
                populateManufacturerDropdown(); // Refresh drugs dropdown
                populateContractDropdowns(); // Refresh contracts dropdowns
                showAlert('Manufacturer added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding manufacturer:', error);
            showAlert('Failed to add manufacturer', 'danger');
        });
}

function updateManufacturer(company_id) {
    const manufacturerData = {
        company_id: document.getElementById('companyId').value,
        name: document.getElementById('manufacturerName').value,
        address: document.getElementById('manufacturerAddress').value
    };

    putData(`/manufacturers/edit/${company_id}`, manufacturerData)
        .then(data => {
            if (data.success) {
                document.getElementById('manufacturerForm').reset();
                document.getElementById('manufacturerEditId').value = '';
                loadManufacturers();
                populateManufacturerDropdown(); // Refresh drugs dropdown
                populateContractDropdowns(); // Refresh contracts dropdowns
                showAlert('Manufacturer updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating manufacturer:', error);
            showAlert('Failed to update manufacturer', 'danger');
        });
}

function editManufacturer(company_id) {
    fetch(`/manufacturers/api/${company_id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch manufacturer');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('manufacturerEditId').value = data.company_id;
            document.getElementById('companyId').value = data.company_id;
            document.getElementById('manufacturerName').value = data.name;
            document.getElementById('manufacturerAddress').value = data.address;
        })
        .catch(error => {
            console.error('Error fetching manufacturer:', error);
            showAlert('Failed to load manufacturer data', 'danger');
        });
}

function deleteManufacturer(company_id) {
    if (confirm('Are you sure?')) {
        deleteData(`/manufacturers/delete/${company_id}`)
            .then(data => {
                if (data.success) {
                    loadManufacturers();
                    populateManufacturerDropdown(); // Refresh drugs dropdown
                    populateContractDropdowns(); // Refresh contracts dropdowns
                    showAlert('Manufacturer deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting manufacturer:', error);
                showAlert('Failed to delete manufacturer', 'danger');
            });
    }
}

// Contract Management Functions
function loadContracts() {
    fetch('/contracts/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch contracts');
            }
            return response.json();
        })
        .then(data => updateTable('contractTableBody', data, ['id', 'manufacturer_name', 'pharmacy_name', 'start_date', 'end_date']))
        .catch(error => {
            console.error('Error loading contracts:', error);
            showAlert('Failed to load contracts', 'danger');
        });
}

function saveContract() {
    const contractData = {
        manufacturer_id: document.getElementById('contractManufacturer').value,
        pharmacy_id: document.getElementById('contractPharmacy').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value
    };

    if (!contractData.manufacturer_id || !contractData.pharmacy_id || !contractData.start_date || !contractData.end_date) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/contracts/add', contractData)
        .then(data => {
            if (data.success) {
                document.getElementById('contractForm').reset();
                document.getElementById('contractEditId').value = '';
                loadContracts();
                showAlert('Contract added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding contract:', error);
            showAlert('Failed to add contract', 'danger');
        });
}

function updateContract(id) {
    const contractData = {
        manufacturer_id: document.getElementById('contractManufacturer').value,
        pharmacy_id: document.getElementById('contractPharmacy').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value
    };

    putData(`/contracts/edit/${id}`, contractData)
        .then(data => {
            if (data.success) {
                document.getElementById('contractForm').reset();
                document.getElementById('contractEditId').value = '';
                loadContracts();
                showAlert('Contract updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating contract:', error);
            showAlert('Failed to update contract', 'danger');
        });
}

function editContract(id) {
    fetch(`/contracts/api/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch contract');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('contractEditId').value = data.id;
            document.getElementById('contractManufacturer').value = data.manufacturer_id;
            document.getElementById('contractPharmacy').value = data.pharmacy_id;
            document.getElementById('startDate').value = data.start_date;
            document.getElementById('endDate').value = data.end_date;
        })
        .catch(error => {
            console.error('Error fetching contract:', error);
            showAlert('Failed to load contract data', 'danger');
        });
}

function deleteContract(id) {
    if (confirm('Are you sure?')) {
        deleteData(`/contracts/delete/${id}`)
            .then(data => {
                if (data.success) {
                    loadContracts();
                    showAlert('Contract deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting contract:', error);
                showAlert('Failed to delete contract', 'danger');
            });
    }
}

// Employee Management Functions
function loadEmployees() {
    fetch('/employees/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }
            return response.json();
        })
        .then(data => updateTable('employeeTableBody', data, ['employee_id', 'name', 'pharmacy_name', 'shift_start', 'shift_end']))
        .catch(error => {
            console.error('Error loading employees:', error);
            showAlert('Failed to load employees', 'danger');
        });
}

function saveEmployee() {
    const employeeData = {
        employee_id: document.getElementById('employeeId').value,
        name: document.getElementById('employeeName').value,
        shift_start: document.getElementById('shiftStart').value,
        shift_end: document.getElementById('shiftEnd').value,
        pharmacy_id: document.getElementById('employeePharmacy').value
    };

    if (!employeeData.employee_id || !employeeData.name || !employeeData.shift_start || !employeeData.shift_end || !employeeData.pharmacy_id) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/employees/add', employeeData)
        .then(data => {
            if (data.success) {
                document.getElementById('employeeForm').reset();
                document.getElementById('employeeEditId').value = '';
                loadEmployees();
                showAlert('Employee added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding employee:', error);
            showAlert('Failed to add employee', 'danger');
        });
}

function updateEmployee(employee_id) {
    const employeeData = {
        employee_id: document.getElementById('employeeId').value,
        name: document.getElementById('employeeName').value,
        shift_start: document.getElementById('shiftStart').value,
        shift_end: document.getElementById('shiftEnd').value,
        pharmacy_id: document.getElementById('employeePharmacy').value
    };

    putData(`/employees/edit/${employee_id}`, employeeData)
        .then(data => {
            if (data.success) {
                document.getElementById('employeeForm').reset();
                document.getElementById('employeeEditId').value = '';
                loadEmployees();
                showAlert('Employee updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating employee:', error);
            showAlert('Failed to update employee', 'danger');
        });
}

function editEmployee(employee_id) {
    fetch(`/employees/api/${employee_id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch employee');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('employeeEditId').value = data.employee_id;
            document.getElementById('employeeId').value = data.employee_id;
            document.getElementById('employeeName').value = data.name;
            document.getElementById('shiftStart').value = data.shift_start;
            document.getElementById('shiftEnd').value = data.shift_end;
            document.getElementById('employeePharmacy').value = data.pharmacy_id;
        })
        .catch(error => {
            console.error('Error fetching employee:', error);
            showAlert('Failed to load employee data', 'danger');
        });
}

function deleteEmployee(employee_id) {
    if (confirm('Are you sure?')) {
        deleteData(`/employees/delete/${employee_id}`)
            .then(data => {
                if (data.success) {
                    loadEmployees();
                    showAlert('Employee deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting employee:', error);
                showAlert('Failed to delete employee', 'danger');
            });
    }
}

// Pharmacy Management Functions
function loadPharmacies() {
    fetch('/pharmacies/api/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch pharmacies');
            }
            return response.json();
        })
        .then(data => updateTable('pharmacyTableBody', data, ['pharm_id', 'name', 'address', 'fax']))
        .catch(error => {
            console.error('Error loading pharmacies:', error);
            showAlert('Failed to load pharmacies', 'danger');
        });
}

function savePharmacy() {
    const pharmacyData = {
        pharm_id: document.getElementById('pharmacyId').value,
        name: document.getElementById('pharmacyName').value,
        address: document.getElementById('pharmacyAddress').value,
        fax: document.getElementById('pharmacyFax').value
    };

    if (!pharmacyData.pharm_id || !pharmacyData.name || !pharmacyData.address || !pharmacyData.fax) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }

    postData('/pharmacies/add', pharmacyData)
        .then(data => {
            if (data.success) {
                document.getElementById('pharmacyForm').reset();
                document.getElementById('pharmacyEditId').value = '';
                loadPharmacies();
                populatePharmacyDropdown(); // Refresh employees dropdown
                populateContractDropdowns(); // Refresh contracts dropdowns
                showAlert('Pharmacy added successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error adding pharmacy:', error);
            showAlert('Failed to add pharmacy', 'danger');
        });
}

function updatePharmacy(pharm_id) {
    const pharmacyData = {
        pharm_id: document.getElementById('pharmacyId').value,
        name: document.getElementById('pharmacyName').value,
        address: document.getElementById('pharmacyAddress').value,
        fax: document.getElementById('pharmacyFax').value
    };

    putData(`/pharmacies/edit/${pharm_id}`, pharmacyData)
        .then(data => {
            if (data.success) {
                document.getElementById('pharmacyForm').reset();
                document.getElementById('pharmacyEditId').value = '';
                loadPharmacies();
                populatePharmacyDropdown(); // Refresh employees dropdown
                populateContractDropdowns(); // Refresh contracts dropdowns
                showAlert('Pharmacy updated successfully!', 'success');
            } else {
                showAlert('Error: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error updating pharmacy:', error);
            showAlert('Failed to update pharmacy', 'danger');
        });
}

function editPharmacy(pharm_id) {
    fetch(`/pharmacies/api/${pharm_id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch pharmacy');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('pharmacyEditId').value = data.pharm_id;
            document.getElementById('pharmacyId').value = data.pharm_id;
            document.getElementById('pharmacyName').value = data.name;
            document.getElementById('pharmacyAddress').value = data.address;
            document.getElementById('pharmacyFax').value = data.fax;
        })
        .catch(error => {
            console.error('Error fetching pharmacy:', error);
            showAlert('Failed to load pharmacy data', 'danger');
        });
}

function deletePharmacy(pharm_id) {
    if (confirm('Are you sure?')) {
        deleteData(`/pharmacies/delete/${pharm_id}`)
            .then(data => {
                if (data.success) {
                    loadPharmacies();
                    populatePharmacyDropdown(); // Refresh employees dropdown
                    populateContractDropdowns(); // Refresh contracts dropdowns
                    showAlert('Pharmacy deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error deleting pharmacy:', error);
                showAlert('Failed to delete pharmacy', 'danger');
            });
    }
}

// Generic table update function
function updateTable(tableId, data, fields) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) {
        console.error(`Table body with id '${tableId}' not found`);
        return;
    }
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            ${fields.map(field => `<td>${item[field] || ''}</td>`).join('')}
            <td>
                <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="${tableId.includes('patient') ? `editPatient('${item[fields[0]]}')` : tableId.includes('doctor') ? `editDoctor('${item[fields[0]]}')` : tableId.includes('drug') ? `editDrug('${item[fields[0]]}')` : tableId.includes('manufacturer') ? `editManufacturer('${item[fields[0]]}')` : tableId.includes('employee') ? `editEmployee('${item[fields[0]]}')` : tableId.includes('contract') ? `editContract('${item[fields[0]]}')` : `editPharmacy('${item[fields[0]]}')`}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700" onclick="${tableId.includes('patient') ? `deletePatient('${item[fields[0]]}')` : tableId.includes('doctor') ? `deleteDoctor('${item[fields[0]]}')` : tableId.includes('drug') ? `deleteDrug('${item[fields[0]]}')` : tableId.includes('manufacturer') ? `deleteManufacturer('${item[fields[0]]}')` : tableId.includes('employee') ? `deleteEmployee('${item[fields[0]]}')` : tableId.includes('contract') ? `deleteContract('${item[fields[0]]}')` : `editPharmacy('${item[fields[0]]}')`}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mb-4`;
    alertDiv.textContent = message;
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(alertDiv, main.firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }
}