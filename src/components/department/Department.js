import React, { useState } from 'react';
import './Department.css';
import { useNavigate } from 'react-router-dom'; // For navigating back to the login page
import logo from './Logo.png';

const departments = [
  { id: 20, name: "ABSTRACTION", identityId: 200302050, specialty: "Hospital Services", location: "Pre-Registration", serviceArea: "CARLE HOSPITAL" },
  { id: 26, name: "ADULT MEDICINE PWAM PBB", identityId: 200612664, specialty: "Windsor Primary Care", location: "URBANA ON WINDSOR", serviceArea: "CARLE HOSPITAL" },
  { id: 30, name: "CARDIOLOGY", identityId: 200703456, specialty: "Heart Care", location: "Main Building", serviceArea: "CARLE HOSPITAL" },
  // Add more rows as needed...
];

const Department = ({ onDepartmentSelect }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate(); // For navigation (Cancel button functionality)

  const handleSelect = () => {
    if (selectedDepartment) {
      onDepartmentSelect(selectedDepartment); // Pass selected department up
    } else {
      alert('Please select a department.');
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleCancel = () => {
    navigate('/'); // Navigate back to the login page directly from the Department component
  };

  return (
    <div className="login-container">
      <div className="background-image" />
      <div className="logo-container">
        <img src={logo} alt="EPIC Systems Logo" className="login-logo" />
      </div>
      <div className="login-box">
        <h2 className="department-header">Department:</h2>
        <div className="form-group">
          <div className="department-input-container">
            <button onClick={toggleDropdown} className="form-input dropdown-button">
              <span className="magnifying-glass">&#128269;</span> {/* Magnifying Glass Icon */}
              {selectedDepartment || "Select a department"}
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <table className="dropdown-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Department</th>
                      <th>Identity ID</th>
                      <th>Specialty</th>
                      <th>Location</th>
                      <th>Service Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr
                        key={dept.id}
                        className="table-row"
                        onClick={() => {
                          setSelectedDepartment(dept.name);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <td>{dept.id}</td>
                        <td>{dept.name}</td>
                        <td>{dept.identityId}</td>
                        <td>{dept.specialty}</td>
                        <td>{dept.location}</td>
                        <td>{dept.serviceArea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={handleSelect} className="continue-button">Continue</button>
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Department;
