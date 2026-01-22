package com.example.homenursing.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.ServiceConfiguration;
import com.example.homenursing.service.ServiceConfigurationService;

@RestController
@RequestMapping("/api/service-configurations")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceConfigurationController {

    @Autowired
    private ServiceConfigurationService serviceConfigurationService;

    @GetMapping
    public List<ServiceConfiguration> getAllServiceConfigurations() {
        return serviceConfigurationService.getAllServiceConfigurations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceConfiguration> getServiceConfigurationById(@PathVariable Long id) {
        Optional<ServiceConfiguration> serviceConfiguration = serviceConfigurationService.getServiceConfigurationById(id);
        return serviceConfiguration.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ServiceConfiguration createServiceConfiguration(@RequestBody ServiceConfiguration serviceConfiguration) {
        return serviceConfigurationService.saveServiceConfiguration(serviceConfiguration);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceConfiguration> updateServiceConfiguration(@PathVariable Long id, @RequestBody ServiceConfiguration serviceConfigurationDetails) {
        Optional<ServiceConfiguration> serviceConfiguration = serviceConfigurationService.getServiceConfigurationById(id);
        if (serviceConfiguration.isPresent()) {
            ServiceConfiguration updatedServiceConfiguration = serviceConfiguration.get();
            updatedServiceConfiguration.setNurse(serviceConfigurationDetails.getNurse());
            updatedServiceConfiguration.setServiceType(serviceConfigurationDetails.getServiceType());
            updatedServiceConfiguration.setIsActive(serviceConfigurationDetails.getIsActive());
            return ResponseEntity.ok(serviceConfigurationService.saveServiceConfiguration(updatedServiceConfiguration));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceConfiguration(@PathVariable Long id) {
        serviceConfigurationService.deleteServiceConfiguration(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nurse/{nurseId}")
    public List<ServiceConfiguration> getServiceConfigurationsByNurseId(@PathVariable Long nurseId) {
        return serviceConfigurationService.getServiceConfigurationsByNurseId(nurseId);
    }

    @GetMapping("/service-type/{serviceTypeId}")
    public List<ServiceConfiguration> getServiceConfigurationsByServiceTypeId(@PathVariable Long serviceTypeId) {
        return serviceConfigurationService.getServiceConfigurationsByServiceTypeId(serviceTypeId);
    }

    @GetMapping("/nurses")
    public List<Nurse> getNursesByServiceTypeAndBranch(@RequestParam Long serviceTypeId, @RequestParam Long branchId) {
        return serviceConfigurationService.getNursesByServiceTypeAndBranch(serviceTypeId, branchId);
    }
}