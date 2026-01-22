package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.ServiceType;
import com.example.homenursing.repository.ServiceTypeRepository;

@Service
public class ServiceTypeService {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    public List<ServiceType> getAllActiveServiceTypes() {
        return serviceTypeRepository.findByActiveTrue();
    }

    public Optional<ServiceType> getServiceTypeById(Long id) {
        return serviceTypeRepository.findById(id);
    }

    public ServiceType saveServiceType(ServiceType serviceType) {
        return serviceTypeRepository.save(serviceType);
    }

    public void deleteServiceType(Long id) {
        serviceTypeRepository.deleteById(id);
    }
}