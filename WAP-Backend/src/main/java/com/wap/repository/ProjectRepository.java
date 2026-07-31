package com.wap.repository;

import com.wap.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOrganization_IdOrderByDeadlineAsc(Long orgId);
}
