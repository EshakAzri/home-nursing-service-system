package com.example.homenursing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.homenursing.entity.ServiceConfiguration;

@Repository
public interface ServiceConfigurationRepository extends JpaRepository<ServiceConfiguration, Long> {

    List<ServiceConfiguration> findByNurseIdAndIsActiveTrue(Long nurseId);

    List<ServiceConfiguration> findByServiceTypeIdAndIsActiveTrue(Long serviceTypeId);

    @Query("SELECT sc FROM ServiceConfiguration sc WHERE sc.nurse.id = :nurseId AND sc.serviceType.id = :serviceTypeId AND sc.isActive = true")
    ServiceConfiguration findByNurseAndServiceType(@Param("nurseId") Long nurseId, @Param("serviceTypeId") Long serviceTypeId);

    @Query("SELECT DISTINCT sc.nurse FROM ServiceConfiguration sc WHERE sc.serviceType.id = :serviceTypeId AND sc.nurse.branch.id = :branchId AND sc.nurse.isAvailable = true AND sc.isActive = true")
    List<com.example.homenursing.entity.Nurse> findNursesByServiceTypeAndBranch(@Param("serviceTypeId") Long serviceTypeId, @Param("branchId") Long branchId);
}