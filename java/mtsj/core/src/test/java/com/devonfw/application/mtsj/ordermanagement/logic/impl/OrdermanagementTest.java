package com.devonfw.application.mtsj.ordermanagement.logic.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.transaction.Transactional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.test.context.support.ReactorContextTestExecutionListener;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithSecurityContextTestExecutionListener;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.TestExecutionListeners;

import com.devonfw.application.mtsj.SpringBootApp;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.BookingEto;
import com.devonfw.application.mtsj.dishmanagement.common.api.to.DishEto;
import com.devonfw.application.mtsj.dishmanagement.dataaccess.api.IngredientEntity;
import com.devonfw.application.mtsj.general.common.ApplicationComponentTest;
import com.devonfw.application.mtsj.general.common.api.constants.Roles;
import com.devonfw.application.mtsj.general.common.impl.security.ApplicationAccessControlConfig;
import com.devonfw.application.mtsj.ordermanagement.common.api.exception.NoBookingException;
import com.devonfw.application.mtsj.ordermanagement.common.api.exception.NoInviteException;
import com.devonfw.application.mtsj.ordermanagement.common.api.exception.OrderAlreadyExistException;
import com.devonfw.application.mtsj.ordermanagement.common.api.exception.WrongTokenException;
import com.devonfw.application.mtsj.ordermanagement.common.api.to.OrderCto;
import com.devonfw.application.mtsj.ordermanagement.common.api.to.OrderEto;
import com.devonfw.application.mtsj.ordermanagement.common.api.to.OrderLineCto;
import com.devonfw.application.mtsj.ordermanagement.common.api.to.OrderLineEto;
import com.devonfw.application.mtsj.ordermanagement.common.api.to.OrderSearchCriteriaTo;
import com.devonfw.application.mtsj.ordermanagement.dataaccess.api.OrderEntity;
import com.devonfw.application.mtsj.ordermanagement.dataaccess.api.repo.OrderRepository;
import com.devonfw.application.mtsj.ordermanagement.logic.api.Ordermanagement;
import com.devonfw.module.basic.common.api.config.SpringProfileConstants;
import com.devonfw.module.test.common.base.ComponentTest;

/**
 * Test for {@link Ordermanagement}
 *
 */
@Profile("hana")

@TestExecutionListeners(listeners = { WithSecurityContextTestExecutionListener.class,
ReactorContextTestExecutionListener.class })

@SpringBootTest(classes = SpringBootApp.class)
@Transactional
@ExtendWith(MockitoExtension.class)
public class OrdermanagementTest extends ComponentTest {

  @Inject
  private Ordermanagement orderManagement;

  @Inject
  private OrderRepository orderDao;

  OrderCto orderCto;

  /**
   * Creation of needed objects
   */
  @Override
  public void doSetUp() {

    super.doSetUp();

    // extra ingredients
    IngredientEntity i1 = new IngredientEntity();
    i1.setId(0L);
    IngredientEntity i2 = new IngredientEntity();
    i2.setId(1L);
    List<IngredientEntity> extras = new ArrayList<>();
    extras.add(i1);
    extras.add(i2);

    // Dish
    DishEto dishEto = new DishEto();
    dishEto.setId(5L);

    // OrderLine Eto 1
    OrderLineEto olEto1 = new OrderLineEto();
    olEto1.setAmount(3);
    olEto1.setComment("This is a test order line");
    olEto1.setDishId(dishEto.getId());

    // OrderLine Eto 2
    OrderLineEto olEto2 = new OrderLineEto();
    olEto2.setAmount(1);
    olEto2.setComment("This is another order line");
    olEto2.setDishId(dishEto.getId());

    // order line 1
    OrderLineCto ol1 = new OrderLineCto();
    ol1.setDish(dishEto);
    ol1.setOrderLine(olEto1);

    // order line 2
    OrderLineCto ol2 = new OrderLineCto();
    ol2.setDish(dishEto);
    ol1.setOrderLine(olEto2);

    // order
    List<OrderLineCto> lines = new ArrayList<>();
    lines.add(ol1);
    // lines.add(ol2);

    BookingEto bookingEto = new BookingEto();
    bookingEto.setBookingToken("CB_20170510_123502595Z");
    this.orderCto = new OrderCto();
    this.orderCto.setBooking(bookingEto);
    this.orderCto.setOrderLines(lines);

  }

  @AfterEach
  public void after(TestInfo testInfo) {

    if (testInfo.getTags().contains("Revert")) {
      this.orderDao.deleteById(0L);
    }
  }

  /**
   * Tests if an order is created
   */
  @Test
  public void createAnOrder() {

    OrderEto createdOrder = this.orderManagement.saveOrder(this.orderCto);
    assertThat(createdOrder).isNotNull();
  }

  // ================================================================================
  // {@link OrdermanagementImpl} TOKEN Tests
  // ================================================================================

  /**
   * Tests that an order with a wrong token is not created
   */
  @Test
  public void createAnOrderWithWrongToken() {

    BookingEto bookingEto = new BookingEto();
    bookingEto.setBookingToken("wrongToken");
    this.orderCto.setBooking(bookingEto);
    try {
      this.orderManagement.saveOrder(this.orderCto);
    } catch (Exception e) {
      WrongTokenException wte = new WrongTokenException();
      assertThat(e.getClass()).isEqualTo(wte.getClass());
    }
  }

  /**
   * Tests that an already created order is not created again
   */
  @Test
  public void createAnOrderAlreadyCreated() {

    BookingEto bookingEto = new BookingEto();
    bookingEto.setBookingToken("CB_20170509_123502555Z");
    this.orderCto.setBooking(bookingEto);
    try {
      this.orderManagement.saveOrder(this.orderCto);
    } catch (Exception e) {
      OrderAlreadyExistException oae = new OrderAlreadyExistException();
      assertThat(e.getClass()).isEqualTo(oae.getClass());
    }
  }

  /**
   * Tests that an order with a booking token that does not exist is not created
   */
  @Test
  public void createAnOrderBookingNotExist() {

    BookingEto bookingEto = new BookingEto();
    bookingEto.setBookingToken("CB_Not_Existing_Token");
    this.orderCto.setBooking(bookingEto);
    try {
      this.orderManagement.saveOrder(this.orderCto);
    } catch (Exception e) {
      NoBookingException nb = new NoBookingException();
      assertThat(e.getClass()).isEqualTo(nb.getClass());
    }
  }

  /**
   * Tests that an order with a guest token that does not exist is not created
   */
  @Test
  public void createAnOrderInviteNotExist() {

    BookingEto bookingEto = new BookingEto();
    bookingEto.setBookingToken("GB_Not_Existing_Token");
    this.orderCto.setBooking(bookingEto);
    try {
      this.orderManagement.saveOrder(this.orderCto);
    } catch (Exception e) {
      NoInviteException ni = new NoInviteException();
      assertThat(e.getClass()).isEqualTo(ni.getClass());
    }
  }

  // ================================================================================
  // {@link OrdermanagementImpl} edited ordersearches
  // ================================================================================

  /**
   * Test to get all non-archived orders as list and is not null
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void getNonArchivedOrders() {
    OrderSearchCriteriaTo to = new OrderSearchCriteriaTo();
    PageRequest pageable = PageRequest.of(0, 8); //, Sort.by(Direction.ASC, "booking.date"));
    to.setPageable(pageable);
    Page<OrderCto> aCtos = this.orderManagement.findOrderCtos(to);

    assertThat(aCtos).isNotNull();
  }

  /**
   * Test for get all archived orders as list and is not null
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void getArchivedOrders() {

    OrderSearchCriteriaTo to = new OrderSearchCriteriaTo();
    PageRequest pageable = PageRequest.of(0, 8, Sort.by(Direction.ASC, "id"));
    to.setPageable(pageable);
    this.orderManagement.cancelOrder(5L);
    Page<OrderCto> aCtos = this.orderManagement.findArchivedCtos(to);

    assertThat(aCtos).isNotNull();
  }

  // ================================================================================
  // {@link OrdermanagementImpl} waiter status tests
  // ================================================================================

  /**
   * Tests that an default waiter-status is on default
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void checkDefaultStatusOnCreate() {

    OrderEntity entity = this.orderDao.find(0L);
    OrderCto cto = new OrderCto();
    OrderEto transferObject = new OrderEto();
    transferObject.setId(entity.getId());

    cto.setOrder(transferObject);
    OrderEto result = this.orderManagement.updateWaiterStatus(cto);

    assertEquals(0, result.getStatus());
  }

  /**
   * Tests wrong default status that is detected
   */
  @Test
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  @Rollback(true)
  public void checkIfDefaultWaiterStatusOnInvalidStatus() {

    OrderEntity updatingEntity = this.orderDao.find(0L);

    OrderEto transferObject = new OrderEto();
    transferObject.setId(updatingEntity.getId());
    transferObject.setStatus(4);

    OrderCto cto = new OrderCto();
    cto.setOrder(transferObject);
    OrderEto result = this.orderManagement.updateWaiterStatus(cto);

    assertEquals(0, result.getStatus());
  }

  /**
   * Tests changed new waiter-status is successful
   */
  @Test
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  @Rollback(true)
  public void checkChangedWaiterStatus() {
	  
    OrderEntity entity = this.orderDao.find(0L);

    OrderEto transferObject = new OrderEto();
    transferObject.setId(entity.getId());
    transferObject.setStatus(1);
    OrderCto cto = new OrderCto();
    cto.setOrder(transferObject);

    OrderEto result = this.orderManagement.updateWaiterStatus(cto);

    assertEquals(1, result.getStatus());
  }

  // ================================================================================
  // {@link OrdermanagementImpl} archived / canceled states tests
  // ================================================================================

  /**
   * Test if a new Order is not archived
   */
  @Test
  @Rollback(true)
  public void NotArchivedOnNewCreatedOrder() {

    boolean b = this.orderDao.find(0L).getArchived();
    assertEquals(false, b);
  }

  /**
   * Test if a new order is not canceled
   */
  @Test
  @Rollback(true)
  public void NotCanceledOnNewCreatedOrder() {

    boolean b = this.orderDao.find(0L).getCanceled();
    assertEquals(false, b);
  }

  /**
   * Test if a order with default status can be canceled
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void CancelOrderWithDefaultStatus() {

    OrderEntity entity = this.orderDao.find(0L);
    this.orderManagement.cancelOrder(entity.getId());

    assertEquals(true, this.orderDao.find(0L).getCanceled());
  }

  /**
   * Test if a order that is canceled gonna be archived
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void ArchivedIfItsCanceled() {

    OrderEntity entity = this.orderDao.find(0L);
    this.orderManagement.cancelOrder(entity.getId());

    assertEquals(true, this.orderDao.find(0L).getArchived());
  }

  /**
   * Test if anorder is archived if its set on paid and deliveried state
   */
  @Test
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  @Rollback(true)
  public void ArchivedIfSetOnPaid() {

    OrderCto cto = new OrderCto();

    OrderEto transferObject = new OrderEto();
    transferObject.setId(0L);
    transferObject.setPaid(true);
    transferObject.setStatus(3);
    cto.setOrder(transferObject);

    this.orderManagement.updateWaiterStatus(cto);
    OrderEto result = this.orderManagement.updatePaymentStatus(cto);

    assertEquals(true, result.getArchived());
  }

  /**
   * Test if reactivated order is not archived anymore
   */
  @Test
  @Rollback(true)
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void NotArchivedAnymoreOnReactivated() {

    OrderEntity entity = this.orderDao.find(0L);
    this.orderManagement.cancelOrder(entity.getId());
    this.orderManagement.cancelOrder(entity.getId());

    assertEquals(false, this.orderDao.find(0L).getArchived());
  }

  /**
   * test if order that is reactivated the status is set back on default
   */
  @Test
  @WithMockUser(username = "waiter", authorities = { Roles.WAITER })
  public void ChangedStatusToDefaultOnReactivated() {

    OrderCto cto = new OrderCto();

    OrderEto transferObject = new OrderEto();
    transferObject.setId(0L);
    transferObject.setPaid(true);
    transferObject.setStatus(3);

    cto.setOrder(transferObject);

    this.orderManagement.updateWaiterStatus(cto);
    this.orderManagement.updatePaymentStatus(cto);
    this.orderManagement.cancelOrder(transferObject.getId());

    assertEquals(0, this.orderDao.find(0L).getStatus());
  }
}
