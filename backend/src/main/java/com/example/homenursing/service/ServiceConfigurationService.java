package com.example.homenursing.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.homenursing.entity.Nurse;
import com.example.homenursing.entity.ServiceConfiguration;
import com.example.homenursing.repository.ServiceConfigurationRepository;

@Service
public class ServiceConfigurationService {

    @Autowired
    private ServiceConfigurationRepository serviceConfigurationRepository;

    public List<ServiceConfiguration> getAllServiceConfigurations() {
        return serviceConfigurationRepository.findAll();
    }

    public Optional<ServiceConfiguration> getServiceConfigurationById(Long id) {
        return serviceConfigurationRepository.findById(id);
    }

    public ServiceConfiguration saveServiceConfiguration(ServiceConfiguration serviceConfiguration) {
        return serviceConfigurationRepository.save(serviceConfiguration);
    }

    public void deleteServiceConfiguration(Long id) {
        serviceConfigurationRepository.deleteById(id);
    }

    public List<ServiceConfiguration> getServiceConfigurationsByNurseId(Long nurseId) {
        return serviceConfigurationRepository.findByNurseIdAndIsActiveTrue(nurseId);
    }

    public List<ServiceConfiguration> getServiceConfigurationsByServiceTypeId(Long serviceTypeId) {
        return serviceConfigurationRepository.findByServiceTypeIdAndIsActiveTrue(serviceTypeId);
    }

    public ServiceConfiguration getServiceConfigurationByNurseAndServiceType(Long nurseId, Long serviceTypeId) {
        return serviceConfigurationRepository.findByNurseAndServiceType(nurseId, serviceTypeId);
    }

    public List<Nurse> getNursesByServiceTypeAndBranch(Long serviceTypeId, Long branchId) {
        return serviceConfigurationRepository.findNursesByServiceTypeAndBranch(serviceTypeId, branchId);
    }
}