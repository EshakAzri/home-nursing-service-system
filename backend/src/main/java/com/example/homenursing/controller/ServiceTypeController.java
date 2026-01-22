package com.example.homenursing.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.entity.ServiceType;
import com.example.homenursing.service.ServiceTypeService;

@RestController
@RequestMapping("/api/service-types")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceTypeController {

    @Autowired
    private ServiceTypeService serviceTypeService;

    @GetMapping
    public ResponseEntity<List<ServiceType>> getAllActiveServiceTypes() {
        List<ServiceType> serviceTypes = serviceTypeService.getAllActiveServiceTypes();
        return ResponseEntity.ok(serviceTypes);
    }

    @PostMapping
    public ResponseEntity<ServiceType> createServiceType(@RequestBody ServiceType serviceType) {
        ServiceType created = serviceTypeService.saveServiceType(serviceType);
        return ResponseEntity.ok(created);
    }
}