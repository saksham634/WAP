package com.wap.repository;

import com.wap.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmployeeId(String employeeId);
    
    List<User> findByOrganization_Id(Long orgId);
    long countByOrganization_Id(Long orgId);
    Optional<User> findByEmployeeIdAndOrganization_Id(String employeeId, Long orgId);
}