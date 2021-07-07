package com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devonfw.application.mtsj.usermanagement.dataaccess.api.ResetTokenEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;
import com.devonfw.module.jpa.dataaccess.api.data.DefaultRepository;

/**
 * {@link DefaultRepository} for {@link ResetTokenEntity}.
 */
public interface ResetTokenRepository extends DefaultRepository<ResetTokenEntity> {

	/**
	 * @param id to search the correct user
	 * @return the {@link ResetTokenEntity} object that matched the search.
	 */
	@Query("SELECT resettoken FROM ResetTokenEntity resettoken" //
			+ " WHERE idUser = :id")
	ResetTokenEntity findByUserId(@Param("id") Long id);

	/**
	 * @param token to search the correct token
	 * @return the {@link ResetTokenEntity} object that matched the search.
	 */
	@Query("SELECT resettoken FROM ResetTokenEntity resettoken" //
			+ " WHERE token = :token")
	ResetTokenEntity findByToken(@Param("token") String token);
}