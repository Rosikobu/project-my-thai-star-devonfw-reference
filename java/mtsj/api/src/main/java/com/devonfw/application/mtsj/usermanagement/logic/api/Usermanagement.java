package com.devonfw.application.mtsj.usermanagement.logic.api;

import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import org.springframework.data.domain.Page;

import com.devonfw.application.mtsj.general.common.api.UserProfile;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenMessageEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserQrCodeTo;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserRoleEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserRoleSearchCriteriaTo;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserSearchCriteriaTo;

/**
 * Interface for Usermanagement component.
 */
public interface Usermanagement {

	/**
	 * Returns a User by its id 'id'.
	 *
	 * @param id The id 'id' of the User.
	 * @return The {@link UserEto} with id 'id'
	 */
	UserEto findUser(Long id);

	/**
	 * Returns a User by its userName 'userName'.
	 *
	 * @param userName The userName 'userName' of the User.
	 * @return The {@link UserEto} with userName 'userName'
	 */
	UserEto findUserbyName(String userName);

	/**
	 * Returns a paginated list of Users matching the search criteria.
	 *
	 * @param criteria the {@link UserSearchCriteriaTo}.
	 * @return the {@link List} of matching {@link UserEto}s.
	 */
	Page<UserEto> findUserEtos(UserSearchCriteriaTo criteria);

	/**
	 * Deletes a user from the database by its id 'userId'.
	 *
	 * @param userId Id of the user to delete
	 * @return boolean <code>true</code> if the user can be deleted,
	 *         <code>false</code> otherwise
	 */
	boolean deleteUser(Long userId);

	/**
	 * @throws EmailAlreadyExistsException Saves a user and store it in the
	 * database.
	 *
	 * @param user the {@link UserEto} to create. @return the new {@link UserEto}
	 * that has been saved with ID and version. @throws
	 */
	UserEto saveUser(UserEto user) throws EntityExistsException;

	/**
	 * check if user exists for updating by its id 'userId'.
	 *
	 * @param userId Id of the user to check
	 * @return boolean <code>true</code> if the user can be updated,
	 *         <code>false</code> otherwise
	 */
	boolean updateUserIfExist(UserEto user);

	/**
	 * Pick the boolean and persist it for the user.
	 *
	 * @param user the {@link UserEto} to create.
	 * @return the new {@link UserEto} that has been saved with ID and version.
	 */
	UserEto saveUserTwoFactor(UserEto user);

	/**
	 * Only returns the necessary info.
	 *
	 * @param username the {@link String} to create.
	 * @return the new {@link UserEto} that has been saved with ID and version.
	 */
	UserEto getUserStatus(String username);

	/**
	 * Create an QR Code to the belonging user
	 *
	 * @param username the {@link UserQrCodeTo} to create.
	 */
	UserQrCodeTo generateUserQrCode(String username);

	/**
	 * Returns a UserRole by its id 'id'.
	 *
	 * @param id The id 'id' of the UserRole.
	 * @return The {@link UserRoleEto} with id 'id'
	 */
	UserRoleEto findUserRole(Long id);

	/**
	 * Returns a paginated list of UserRoles matching the search criteria.
	 *
	 * @param criteria the {@link UserRoleSearchCriteriaTo}.
	 * @return the {@link List} of matching {@link UserRoleEto}s.
	 */
	Page<UserRoleEto> findUserRoleEtos(UserRoleSearchCriteriaTo criteria);

	/**
	 * Deletes a userRole from the database by its id 'userRoleId'.
	 *
	 * @param userRoleId Id of the userRole to delete
	 * @return boolean <code>true</code> if the userRole can be deleted,
	 *         <code>false</code> otherwise
	 */
	boolean deleteUserRole(Long userRoleId);

	/**
	 * Saves a userRole and store it in the database.
	 *
	 * @param userRole the {@link UserRoleEto} to create.
	 * @return the new {@link UserRoleEto} that has been saved with ID and version.
	 */
	UserRoleEto saveUserRole(UserRoleEto userRole);

	/**
	 * @param login The login of the requested user.
	 * @return The {@link UserProfile} with the given <code>login</code> or
	 *         {@code null} if no such object exists.
	 */
	UserProfile findUserProfileByLogin(String login);

	/**
	 * Updates a user and store it changes in the database.
	 *
	 * @param user the {@link UserEto} to update.
	 * @return the new {@link UserEto} that has been updated with ID and version.
	 */
	UserEto updateUser(UserEto user) throws EntityNotFoundException;

	/**
	 * process the reset password request for user
	 *
	 * @param user the {@link UserEto} to reset the password.
	 * @return the new {@link ResetTokenMessageEto} with the returned message for
	 *         reseting the password.
	 */
	ResetTokenMessageEto resetPassword(UserEto user);

	/**
	 * process the change password method for user
	 *
	 * @param ResetTokenEto the {@link ResetTokenEto} with token and password for
	 *                      change the current password.
	 * @return the new {@link ResetTokenMessageEto} with the returned message if
	 *         successful.
	 */
	ResetTokenMessageEto changeForgetPassword(ResetTokenEto request);

	/**
	 * check if resettoken exists
	 *
	 * @param user the {@link UserEto} to update.
	 * @return the new {@link UserEto} that has been updated with ID and version.
	 */
	void validateToken(String token);

}
