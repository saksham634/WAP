package com.wap.employee_service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:5173") // Crucial for allowing React connection
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    // Endpoint to read all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Endpoint to create a new employee record
    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        // Simple logic to automatically increment the readable Employee ID string
        long nextId = employeeRepository.count() + 1;
        employee.setEmployeeId("EMP00" + nextId);
        
        return employeeRepository.save(employee);
    }
}