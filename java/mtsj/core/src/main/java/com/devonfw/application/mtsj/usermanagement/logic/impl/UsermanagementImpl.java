package com.devonfw.application.mtsj.usermanagement.logic.impl;

import java.sql.SQLIntegrityConstraintViolationException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;

import org.jboss.aerogear.security.otp.api.Base32;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;

import com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.BookingEntity;
import com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.repo.BookingRepository;
import com.devonfw.application.mtsj.bookingmanagement.logic.api.Bookingmanagement;
import com.devonfw.application.mtsj.general.common.api.UserProfile;
import com.devonfw.application.mtsj.general.common.api.datatype.Role;
import com.devonfw.application.mtsj.general.common.api.to.UserDetailsClientTo;
import com.devonfw.application.mtsj.general.common.base.QrCodeService;
import com.devonfw.application.mtsj.general.common.impl.security.ApplicationAccessControlConfig;
import com.devonfw.application.mtsj.general.logic.base.AbstractComponentFacade;
import com.devonfw.application.mtsj.mailservice.logic.api.Mail;
import com.devonfw.application.mtsj.ordermanagement.dataaccess.api.OrderLineEntity;
import com.devonfw.application.mtsj.usermanagement.common.api.UserRole;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenMessageEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserQrCodeTo;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserRoleEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserRoleSearchCriteriaTo;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserSearchCriteriaTo;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.ResetTokenEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserRoleEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo.ResetTokenRepository;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo.UserRepository;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo.UserRoleRepository;
import com.devonfw.application.mtsj.usermanagement.logic.api.Usermanagement;

import scala.collection.concurrent.Debug;

/**
 * Implementation of component interface of usermanagement
 */
/*
 * 
 * Customer:	- norbert - password
 * Waiter:		- alex.r - waiter
 * Admin:		- manfred.m - admin123
 * 
 * 
 */
@Named
@Transactional
public class UsermanagementImpl extends AbstractComponentFacade implements Usermanagement {

	private static final Logger LOG = LoggerFactory.getLogger(UsermanagementImpl.class);

	@Inject
	private UserRepository userDao;

	@Inject
	private ResetTokenRepository resetTokenDao;

	@Inject
	private UserRoleRepository userRoleDao;
	
	@Inject
	private BookingRepository bookingRepository;

	@Inject
	private UsermanagementUtilityImpl utils;

	/**
	 * The constructor.
	 */
	public UsermanagementImpl() {

		super();
	}

	@Override
	public UserEto findUser(Long id) {

		LOG.debug("Get User with id {} from database.", id);
		return getBeanMapper().map(getUserDao().find(id), UserEto.class);
	}

	@Override
	public UserQrCodeTo generateUserQrCode(String username) {

		LOG.debug("Get User with username {} from database.", username);
		UserEntity user = getBeanMapper().map(getUserDao().findByUsername(username), UserEntity.class);
		initializeSecret(user);
		if (user != null && user.getTwoFactorStatus()) {
			return QrCodeService.generateQrCode(user);
		} else {
			return null;
		}
	}

	@Override
	public UserEto getUserStatus(String username) {

		LOG.debug("Get User with username {} from database.", username);
		return getBeanMapper().map(getUserDao().findByUsername(username), UserEto.class);
	}

	@Override
	public UserEto findUserbyName(String userName) {

		UserEntity entity = this.userDao.findByUsername(userName);
		return getBeanMapper().map(entity, UserEto.class);
	}

	@Override
	@RolesAllowed(ApplicationAccessControlConfig.GROUP_ADMIN)
	public Page<UserEto> findUserEtos(UserSearchCriteriaTo criteria) {

		Page<UserEntity> users = getUserDao().findUsers(criteria);
		return mapPaginatedEntityList(users, UserEto.class);
	}

	/*
	 * At this point, only the user is removed. Some laws require that user information 
	 * be removed, but the storage of orders are subject to legal requirements 
	 * of certain countries
	 * In this case only the reference to the user is removed, but not the order.
	 */
	boolean preDeleteFromBooking(UserEntity user) {
		List<BookingEntity> listOfHosts = bookingRepository.findBookingByHostId(user);
		for(BookingEntity host : listOfHosts) {			
			host.setModificationCounter(host.getModificationCounter());
			host.setUser(null);
			host.setEmail("deleted");
			host.setName("deleted");
			bookingRepository.save(host);
		}
		return true;
	}
	
	@Override
	public boolean deleteUser(Long userId) {

		UserEntity user = getUserDao().find(userId);
		
		preDeleteFromBooking(user);
		
		// delete the user
		try {
			getUserDao().delete(user);			
		} catch (Exception e) {
			throw new IllegalStateException("Is there perhaps an existing reference "
					+ "of the user in another table?");
		}
		
		getUserDao().delete(user);
		
		LOG.debug("The user with id '{}' has been deleted.", userId);
		
		return true;
	}

	public boolean checkTimeStampsForToken(ResetTokenEntity tokenEntity) {
		return ChronoUnit.MINUTES.between(tokenEntity.getCreationDate(), Instant.now()) > utils.getTimeToExpired();
	}
	
	// POST with token AND password, validating process, using ResetTokenEto
	@Override
	public ResetTokenMessageEto changeForgetPassword(ResetTokenEto request) {

		// grab the requested token
		ResetTokenEntity tokenEntity = resetTokenDao.findByToken(request.getToken());		

		// check if given token exists
		if (tokenEntity != null) {

			// grab Requester
			UserEntity user = getUserDao().find(tokenEntity.getUser().getId());
			
			// check timestamps
			if(checkTimeStampsForToken(tokenEntity)) {
				resetTokenDao.delete(tokenEntity);
				throw new EntityNotFoundException("Given Token not bound to any Account");
			}
			
			// get user from db and setup
			UserEntity userEntity = getUserDao().find(tokenEntity.getUser().getId());
			userEntity.setModificationCounter(userEntity.getModificationCounter());

			// set new password
			userEntity.setPassword(request.getPassword());

			// save updated user
			UserEntity resultEntity = getUserDao().save(userEntity);

			// delete token from db
			resetTokenDao.delete(tokenEntity);

			// send mail to inform user
			utils.send_reset_confirmation(resultEntity);

			return notifyUser(user.getUsername(), "Your Password changed.");

		} else {
			throw new EntityNotFoundException("Given Token not bound to any Account");
			//return notifyUser(null, "Given Token not bound to any Account");
		}
	}
	
	// Alternative: GET with token only for validating, return success or failure
	@Override
	public void validateToken(String token) {

		// grab the requested token
		ResetTokenEntity tokenEntity = resetTokenDao.findByToken(token);
		
		if(tokenEntity != null) {			
			// check timestamps
			if(checkTimeStampsForToken(tokenEntity)) {
				resetTokenDao.delete(tokenEntity);
				throw new EntityNotFoundException("Token invalid - not validated within time");
			}
			
		} else {
			throw new EntityNotFoundException("Token invalid - does not exists");
		}
	}
	
	private ResetTokenMessageEto notifyUser(String name, String text) {
		ResetTokenMessageEto message = new ResetTokenMessageEto();
		message.setUserName(name);
		message.setMessage(text);
		return message;
	}

	// create token, send email
	@Override
	public ResetTokenMessageEto resetPassword(UserEto user) {
		
		UserEntity requester = getUserDao().findUserByEmail(user.getEmail());

		// check if email exists
		if (requester != null) {

			// get resetTokenEntity if exists
			ResetTokenEntity checkedTokenEntity = resetTokenDao.findByUserId(requester.getId());

			// remove already existing token, grab modification-counter
			if (checkedTokenEntity != null) {
				resetTokenDao.delete(checkedTokenEntity);
				checkedTokenEntity.setModificationCounter(checkedTokenEntity.getModificationCounter());
			}

			// check new token
			checkedTokenEntity = new ResetTokenEntity();
			checkedTokenEntity.setUser(requester);
			checkedTokenEntity.setCreationDate(Instant.now());

			// create an token
			checkedTokenEntity.setToken(utils.generate_token());

			// save the new token
			resetTokenDao.save(checkedTokenEntity);

			// inform the user
			utils.send_resettoken_mail(requester, checkedTokenEntity);

			return notifyUser(requester.getUsername(), "Email sent.");

		} else {
			
			return notifyUser(null, "Email adress not found.");
		}

	}
	
	@Override
	public UserEto saveUser(UserEto user) throws EntityExistsException {
		Objects.requireNonNull(user, "user");

		// maping
		UserEntity userEntity = getBeanMapper().map(user, UserEntity.class);

		// validate email if already exists
		if (userDao.findByEmail(userEntity.getEmail()) != null) {
			throw new EntityExistsException("Email already exists - cant use email twice.");
		}

		// save entity
		UserEntity resultEntity = getUserDao().save(userEntity);

		LOG.debug("User with id '{}' has been created.", resultEntity.getId());
		return getBeanMapper().map(resultEntity, UserEto.class);
	}

	@Override
	@RolesAllowed(ApplicationAccessControlConfig.GROUP_ADMIN)
	public UserEto updateUser(UserEto user) throws EntityNotFoundException {
		Objects.requireNonNull(user, "user");

		UserEntity userEntity = getBeanMapper().map(user, UserEntity.class);
		
		// check if updating user exists
		if (updateUserIfExist(user)) {
			userEntity.setModificationCounter(findUser(user.getId()).getModificationCounter());
			userEntity.setPassword(
					user.getPassword() == null ? userDao.getHashedPasswordById(user.getId()) : user.getPassword());
		} else {
			// updating user not possible, ID not found
			LOG.debug(
					"User with id '{}' has not been found. You want to update a user as admin that dont exists\" +\r\n"
							+ "    			\" in database. Please Check if id exists",
					userEntity.getId());
			throw new EntityNotFoundException("User with given ID dont exists for updating");
		}

		// save entity
		UserEntity resultEntity = getUserDao().save(userEntity);

		LOG.debug("User with id '{}' has been updated.", resultEntity.getId());
		return getBeanMapper().map(resultEntity, UserEto.class);
	}

	public boolean updateUserIfExist(UserEto user) {
		return user.getId() == null? false : true;
	}

	@Override
	public UserEto saveUserTwoFactor(UserEto user) {

		Objects.requireNonNull(user, "user");
		UserEntity userEntity = getBeanMapper().map(getUserDao().findByUsername(user.getUsername()), UserEntity.class);

		// initialize, validate userEntity here if necessary
		userEntity.setTwoFactorStatus(user.getTwoFactorStatus());
		UserEntity resultEntity = getUserDao().save(userEntity);
		LOG.debug("User with id '{}' has been modified.", resultEntity.getId());
		return getBeanMapper().map(resultEntity, UserEto.class);
	}

	/**
	 * Returns the field 'userDao'.
	 *
	 * @return the {@link UserRepository} instance.
	 */
	public UserRepository getUserDao() {

		return this.userDao;
	}

	@Override
	public UserRoleEto findUserRole(Long id) {

		LOG.debug("Get UserRole with id {} from database.", id);
		return getBeanMapper().map(getUserRoleDao().find(id), UserRoleEto.class);
	}

	@Override
	public Page<UserRoleEto> findUserRoleEtos(UserRoleSearchCriteriaTo criteria) {

		Page<UserRoleEntity> userroles = getUserRoleDao().findUserRoles(criteria);
		return mapPaginatedEntityList(userroles, UserRoleEto.class);
	}

	@Override
	public boolean deleteUserRole(Long userRoleId) {

		UserRoleEntity userRole = getUserRoleDao().find(userRoleId);
		getUserRoleDao().delete(userRole);
		LOG.debug("The userRole with id '{}' has been deleted.", userRoleId);
		return true;
	}

	@Override
	public UserRoleEto saveUserRole(UserRoleEto userRole) {

		Objects.requireNonNull(userRole, "userRole");
		UserRoleEntity userRoleEntity = getBeanMapper().map(userRole, UserRoleEntity.class);

		// initialize, validate userRoleEntity here if necessary
		UserRoleEntity resultEntity = getUserRoleDao().save(userRoleEntity);
		LOG.debug("UserRole with id '{}' has been created.", resultEntity.getId());

		return getBeanMapper().map(resultEntity, UserRoleEto.class);
	}

	/**
	 * Assigns a randomly generated secret for an specific user
	 *
	 * @param user
	 */
	private void initializeSecret(UserEntity user) {

		if (user.getSecret() == null) {
			user.setSecret(Base32.random());
			UserEntity resultEntity = getUserDao().save(user);
			LOG.debug("User with id '{}' has been modified.", resultEntity.getId());
		}
	}

	/**
	 * Returns the field 'userRoleDao'.
	 *
	 * @return the {@link UserRoleRepository} instance.
	 */
	public UserRoleRepository getUserRoleDao() {

		return this.userRoleDao;
	}

	@Override
	public UserProfile findUserProfileByLogin(String login) {

		UserEto userEto = findUserbyName(login);
		UserDetailsClientTo profile = new UserDetailsClientTo();
		profile.setId(userEto.getId());
		profile.setRole(Role.getRoleById(userEto.getUserRoleId()));
		return profile;
	}

}
