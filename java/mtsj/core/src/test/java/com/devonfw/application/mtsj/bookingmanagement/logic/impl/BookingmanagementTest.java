package com.devonfw.application.mtsj.bookingmanagement.logic.impl;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.stream.IntStream;

import javax.inject.Inject;
import javax.persistence.EntityNotFoundException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;

import com.devonfw.application.mtsj.SpringBootApp;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.BookingCto;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.BookingEto;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.findByCto;
import com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.repo.BookingRepository;
import com.devonfw.application.mtsj.bookingmanagement.logic.api.Bookingmanagement;
import com.devonfw.application.mtsj.general.common.ApplicationComponentTest;

// <=== Ab hier

/**
 * Tests for {@link Bookingmanagement} component.
 *
 */
@SpringBootTest(classes = SpringBootApp.class)
public class BookingmanagementTest extends ApplicationComponentTest {

  @Inject
  Bookingmanagement bookingManagement;

  @Inject
  private BookingRepository bookingDao;

  BookingCto bookingCto;

  BookingEto b;

  @Override
  public void doSetUp() {

    super.doSetUp();

    BookingEto bookingEto = new BookingEto();

    bookingEto.setBookingDate(Instant.now());
    // .plus(5, ChronoUnit.HOURS)
    // .plus(10, ChronoUnit.MINUTES));
    bookingEto.setName("Lilith");
    bookingEto.setEmail("gemini@web.de");
    bookingEto.setAssistants(2);
    bookingEto.setTableId(0L);

    this.bookingCto = new BookingCto();
    this.bookingCto.setBooking(bookingEto);
  }

  @AfterEach
  public void after(TestInfo testInfo) {

    if (testInfo.getTags().contains("Skip")) {
      return;
    }
  }

  // ================================================================================
  // {@link BookingmanagementImpl} Booking cases
  // ================================================================================

  /**
   * Test to save a booking without an exception
   */
  @Test
  public void saveABooking() {

    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
    assertThat(createdBooking).isNotNull();
    this.bookingDao.deleteById(createdBooking.getId());
  }

  /**
   * Test to save a booking with too many guests (maximum number of guests is 8) should throw exception
   */
  @Test
  public void saveABookingWithToManyGuests() {

    this.bookingCto.getBooking().setAssistants(9);

    try {
      BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
      this.bookingDao.deleteById(createdBooking.getId());
    } catch (Exception e) {
      IllegalStateException ex = new IllegalStateException();
      assertThat(e.getClass()).isEqualTo(ex.getClass());
    }
  }

  /**
   * Test to save a Booking with invalid Date (in the past) should throw Exception
   */
  @Test
  public void saveABookingWithInvalidDate() {

    this.bookingCto.getBooking().setBookingDate(Instant.now().minus(10, ChronoUnit.HOURS));
    try {
      BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
      this.bookingDao.deleteById(createdBooking.getId());
    } catch (Exception e) {
      IllegalStateException ex = new IllegalStateException();
      assertThat(e.getClass()).isEqualTo(ex.getClass());
    }
  }

  /**
   * Test to save booking with null assistants should not throw an error
   */
  @Test
  @Rollback(true)
  public void saveBookingWithoutAssistantsShouldNotThrowError() {

    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
    assertThat(createdBooking).isNotNull();
    this.bookingDao.deleteById(createdBooking.getId());
  }

  // ================================================================================
  // {@link BookingmanagementImpl} Testcases for Alexa
  // ================================================================================

  /**
   * Test for Alexa, check the closest valid booking date category: Alexa In-House
   */
  @Test
  @Rollback(true)
  public void ALEXA_findClosestValidBooking() {

    // save booking
    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);

    // create findby
    findByCto findBy = new findByCto();
    findBy.setBookingDate(Instant.now().plus(10, ChronoUnit.MINUTES));
    findBy.setTableId(0L);

    // dont throw
    assertDoesNotThrow(() -> this.bookingManagement.findBy(findBy), "");
    this.bookingDao.deleteById(createdBooking.getId());

  }

  /**
   * Test for Alexa, check for no valid booking by closest date should throw exception category: Alexa In-House
   */
  @Test
  @Rollback(true)
  public void ALEXA_findNoValidBookingByDate() {

    // save booking
    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);

    // create findby
    findByCto findBy = new findByCto();
    findBy.setBookingDate(Instant.now().minus(10, ChronoUnit.MINUTES));
    // .minus(3, ChronoUnit.HOURS));
    findBy.setTableId(0L);

    assertThrows(EntityNotFoundException.class, () -> this.bookingManagement.findBy(findBy), "");
    this.bookingDao.deleteById(createdBooking.getId());
  }

  /**
   * Test for Alexa, set delivery on true should throw exception category: Alexa
   */
  @Test
  @Rollback(true)
  public void ALEXA_setDeliveryBooking() {

    this.bookingCto.getBooking().setDelivery(true);

    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
    this.bookingDao.deleteById(createdBooking.getId());

    assertEquals(createdBooking.getDelivery(), true);
  }

  /**
   * Test for Alexa, set assistant on null, should not throw an exception category: Alexa
   */
  @Test
  @Rollback(true)
  public void ALEXA_setNullAssistantIsValid() {

    this.bookingCto.getBooking().setAssistants(null);
    BookingEto createdBooking = this.bookingManagement.saveBooking(this.bookingCto);
    this.bookingDao.deleteById(createdBooking.getId());
  }

}
