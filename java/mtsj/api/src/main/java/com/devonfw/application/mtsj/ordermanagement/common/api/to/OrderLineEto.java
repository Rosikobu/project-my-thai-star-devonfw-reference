package com.devonfw.application.mtsj.ordermanagement.common.api.to;

import com.devonfw.application.mtsj.ordermanagement.common.api.OrderLine;
import com.devonfw.module.basic.common.api.to.AbstractEto;

/**
 * Entity transport object of OrderLine
 */
public class OrderLineEto extends AbstractEto implements OrderLine {

  private static final long serialVersionUID = 1L;

  private Long orderId;

  private Long dishId;

  private int amount;

  private String comment;

  @Override
  public Long getOrderId() {

    return this.orderId;
  }

  @Override
  public void setOrderId(Long orderId) {

    this.orderId = orderId;
  }

  @Override
  public Long getDishId() {

    return this.dishId;
  }

  @Override
  public void setDishId(Long dishId) {

    this.dishId = dishId;
  }

  @Override
  public int getAmount() {

    return this.amount;
  }

  @Override
  public void setAmount(int amount) {

    this.amount = amount;
  }

  @Override
  public String getComment() {

    return this.comment;
  }

  @Override
  public void setComment(String comment) {

    this.comment = comment;
  }

  @Override
  public int hashCode() {

    final int prime = 31;
    int result = 1;
    result = prime * result + this.amount;
    result = prime * result + ((this.comment == null) ? 0 : this.comment.hashCode());
    result = prime * result + ((this.dishId == null) ? 0 : this.dishId.hashCode());
    result = prime * result + ((this.orderId == null) ? 0 : this.orderId.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {

    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    OrderLineEto other = (OrderLineEto) obj;
    if (this.amount != other.amount)
      return false;
    if (this.comment == null) {
      if (other.comment != null)
        return false;
    } else if (!this.comment.equals(other.comment))
      return false;
    if (this.dishId == null) {
      if (other.dishId != null)
        return false;
    } else if (!this.dishId.equals(other.dishId))
      return false;
    if (this.orderId == null) {
      if (other.orderId != null)
        return false;
    } else if (!this.orderId.equals(other.orderId))
      return false;
    return true;
  }

}
