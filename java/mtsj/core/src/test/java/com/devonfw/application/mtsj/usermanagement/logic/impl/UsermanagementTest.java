package com.devonfw.application.mtsj.usermanagement.logic.impl;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.inject.Inject;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.test.annotation.Rollback;

import com.devonfw.application.mtsj.SpringBootApp;
import com.devonfw.application.mtsj.general.common.ApplicationComponentTest;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.ResetTokenMessageEto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserCto;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserEto;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.ResetTokenEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo.ResetTokenRepository;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.repo.UserRepository;
import com.devonfw.application.mtsj.usermanagement.logic.api.Usermanagement;
import com.devonfw.application.mtsj.usermanagement.logic.impl.helperinterfaces.UsermanagementUtility;

/**
 * Tests for {@link Usermanagement} component.
 *
 */
@SpringBootTest(classes = SpringBootApp.class)
public class UsermanagementTest extends ApplicationComponentTest {

  @Inject
  Usermanagement userManagement;

  @Inject
  private UserRepository userDao;

  @Inject
  UsermanagementUtility userManagementUtility;

  @Inject
  private ResetTokenRepository resetTokenDao;

  UserCto userCto;

  UserEto userEto;

  /**
   * Creation of needed objects
   */
  @Override
  public void doSetUp() {

    super.doSetUp();

    this.userCto = new UserCto();

    this.userEto = new UserEto();

    this.userEto.setUsername("Lucy");
    this.userEto.setPassword("12345");
    this.userEto.setUserRoleId(0L);
    this.userEto.setEmail("mail@mail.net");

    this.userCto.setUser(this.userEto);

  }

  @AfterEach
  public void after(TestInfo testInfo) {

    if (testInfo.getTags().contains("Skip")) {
      return;
    }

    if (testInfo.getTags().contains("DropTokenRepository")) {
      this.resetTokenDao.deleteAll();
    }
    this.userManagement.deleteUser(this.userManagement.findUserbyName("Lucy").getId());
  }

  // ================================================================================
  // {@link UsermanagementImpl} General User
  // ================================================================================

  /**
   * This test saves some users with same username and check if everything was fine
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void saveMultipleUsers() {

    IntStream.range(0, 14).forEachOrdered(n -> {
      UserEntity ue = new UserEntity();
      ue.setUsername("username");
      ue.setPassword(String.valueOf(n));
      ue.setUserRoleId(0L);
      this.userDao.save(ue);
    });

    assertEquals(14, this.userDao.findAll().stream().filter(u -> u.getUsername().equals("username"))
        .collect(Collectors.toList()).size());
  }

  /**
   * This test checks if an user can be saved without user role
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void saveUserWithNullUserRole() {

    UserEto user = new UserEto();

    user.setUsername("Lilith");
    user.setPassword("123");
    user.setUserRoleId(null);

    assertThrows(DataIntegrityViolationException.class, () -> this.userManagement.saveUser(user), "");
  }

  // ================================================================================
  // {@link UsermanagementImpl} Changing Userdetails Tests
  // ================================================================================

  /**
   * Tests if an user is created
   */
  @Test
  @Rollback(true)
  public void saveAnUser() {

    UserEto createdUser = this.userManagement.saveUser(this.userEto);
    assertThat(createdUser).isNotNull();
  }

  /**
   * Tests if the email can be changed
   */
  @Test
  @Rollback(true)
  public void changeUserMail() {

    UserEto createdUser = this.userManagement.saveUser(this.userEto);
    createdUser.setEmail("newEmail@web.de");
    UserEto result = this.userManagement.updateUser(createdUser);
    assertEquals("newEmail@web.de", result.getEmail());
  }

  /**
   * Test if Userrole can be changed
   */
  @Test
  @Rollback(true)
  public void changeUserRole() {

    UserEto createdUser = this.userManagement.saveUser(this.userEto);
    createdUser.setUserRoleId(1L);
    UserEto result = this.userManagement.updateUser(createdUser);
    assertEquals(1L, result.getUserRoleId());
  }

  /**
   * Test if Username can be changed
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void changeUserName() {

    UserEto createdUser = this.userManagement.saveUser(this.userEto);
    createdUser.setUsername("Lilith");
    createdUser.setEmail("nmail@mail.com");
    UserEto result = this.userManagement.updateUser(createdUser);
    assertEquals("Lilith", result.getUsername());
  }

  /**
   * Test if saving email twice throws exception
   */
  @Test
  @Rollback(true)
  public void saveEmailTwice() {

    this.userManagement.saveUser(this.userEto);
    try {
      this.userManagement.saveUser(this.userEto);
    } catch (Exception e) {
      EntityExistsException ex = new EntityExistsException();
      assertThat(e.getClass()).isEqualTo(ex.getClass());
    }
  }

  /**
   * Test if updating an not existing user throws exception
   */
  @Test
  @Rollback(true)
  public void updateNotExistingUser() {

    UserEto createdUser = this.userManagement.saveUser(this.userEto);
    createdUser.setId(9999L);
    try {
      this.userManagement.updateUser(this.userEto);
    } catch (Exception e) {
      EntityNotFoundException ex = new EntityNotFoundException();
      assertThat(e.getClass()).isEqualTo(ex.getClass());
    }
  }

  // ================================================================================
  // {@link UsermanagementImpl} Passwordmanagement Tests
  // ================================================================================

  /**
   * Test if password can be reset for an user with reset token
   */
  @Test
  @Rollback(true)
  public void resetPasswordProcess() {

    this.userManagement.saveUser(this.userEto);
    ResetTokenMessageEto requestMessage = this.userManagement.resetPassword(this.userEto);
    assertEquals("Email sent.", requestMessage.getMessage());

    ResetTokenEto request = new ResetTokenEto();
    Long requesterId = this.userManagement.findUserbyName("Lucy").getId();
    request.setId(requesterId);
    ResetTokenEntity tokenEntity = this.resetTokenDao.findByUserId(requesterId);
    request.setToken(tokenEntity.getToken());
    request.setPassword("newPass");

    ResetTokenMessageEto successMessage = this.userManagement.changeForgetPassword(request);
    assertEquals("Your Password changed.", successMessage.getMessage());
  }

  /**
   * Test if password can be reset with invalid time reset token can be only used for 20 minutes should throw exception
   */
  @Test
  @Rollback(true)
  @Tag("DropTokenRepository")
  public void resetPasswordWithInvalidTime() {

    this.userManagement.saveUser(this.userEto);
    ResetTokenMessageEto requestMessage = this.userManagement.resetPassword(this.userEto);
    assertEquals("Email sent.", requestMessage.getMessage());

    List<ResetTokenEntity> tokenList = this.resetTokenDao.findAll();
    ResetTokenEntity tokenEntity = tokenList.get(0);

    tokenEntity.setCreationDate(Instant.now().minus(50, ChronoUnit.HOURS));
    this.resetTokenDao.save(tokenEntity);

    ResetTokenEto request = new ResetTokenEto();
    Long requesterId = this.userManagement.findUserbyName("Lucy").getId();
    request.setId(requesterId);
    ResetTokenEntity token = this.resetTokenDao.findByUserId(requesterId);
    request.setToken(token.getToken());
    request.setPassword("newPass");

    assertThrows(EntityNotFoundException.class, () -> this.userManagement.changeForgetPassword(request), "");
  }

  /**
   * Test if password can be reset with invalid token should throw exception
   */
  @Test
  @Rollback(true)
  @Tag("DropTokenRepository")
  public void resetPasswordProcessWithWrongToken() {

    this.userManagement.saveUser(this.userEto);
    ResetTokenMessageEto requestMessage = this.userManagement.resetPassword(this.userEto);
    assertEquals("Email sent.", requestMessage.getMessage());

    ResetTokenEto request = new ResetTokenEto();
    Long requesterId = this.userManagement.findUserbyName("Lucy").getId();
    request.setId(requesterId);
    request.setToken("WRONGTOKEN");
    request.setPassword("newPass");

    assertThrows(EntityNotFoundException.class, () -> this.userManagement.changeForgetPassword(request), "");
  }

  /**
   * Test if password can be reset with not existing email
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void resetPasswordWithNotExistingMail() {

    ResetTokenMessageEto requestMessage = this.userManagement.resetPassword(this.userEto);
    assertEquals("Email adress not found.", requestMessage.getMessage());
  }

  /**
   * Test if not existing token for validating process should throw exception
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void validateNotExistingToken() {

    assertThrows(EntityNotFoundException.class, () -> this.userManagement.validateToken("not_existing_token"), "");
  }

  // ================================================================================
  // {@link UsermanagementUtilityImpl} Email sending Tests
  // ================================================================================

  /**
   * check if static token mail throws no exception (token in mail content)
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void sendStaticTokenMail() {

    ResetTokenEntity tokenEntity = new ResetTokenEntity();
    tokenEntity.setToken("JUNIT RESET TOKEN TEST ");
    UserEntity user = new UserEntity();
    user.setEmail("thdslKF442ob123dsadsaRSAK121@gmx.net");

    assertDoesNotThrow(() -> this.userManagementUtility.send_reset_mail(user, tokenEntity));
  }

  /**
   * check if dynamic token mail throws no exception (token as url)
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void sendDynamicTokenMail() {

    ResetTokenEntity tokenEntity = new ResetTokenEntity();
    tokenEntity.setToken("JUNIT RESET TOKEN TEST ");
    UserEntity user = new UserEntity();
    user.setEmail("thdslKF442ob123dsadsaRSAK121@gmx.net");

    assertDoesNotThrow(() -> this.userManagementUtility.send_resettoken_mail(user, tokenEntity));
  }

  /**
   * check if sending confirmation mail throws no exception
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void sendConfirmationMail() {

    ResetTokenEntity tokenEntity = new ResetTokenEntity();
    tokenEntity.setToken("JUNIT RESET TOKEN TEST ");
    UserEntity user = new UserEntity();
    user.setEmail("thdslKF442ob123dsadsaRSAK121@gmx.net");

    assertDoesNotThrow(() -> this.userManagementUtility.send_reset_confirmation(user));
  }

  // ================================================================================
  // {@link UsermanagementImpl} Adminmanagement Tests
  // ================================================================================

  /**
   * check if deleting user works
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void deleteUser() {

    assertDoesNotThrow(() -> this.userManagement.deleteUser(4L));
  }

  /**
   * check if not existing user can be deleted throws exception
   */
  @Test
  @Rollback(true)
  @Tag("Skip")
  public void deleteNonExistingUser() {

    assertThrows(EmptyResultDataAccessException.class, () -> this.userManagement.deleteUser(99L), "");
  }

  // ================================================================================
  // {@link UsermanagementImpl} Others
  // ================================================================================

}
