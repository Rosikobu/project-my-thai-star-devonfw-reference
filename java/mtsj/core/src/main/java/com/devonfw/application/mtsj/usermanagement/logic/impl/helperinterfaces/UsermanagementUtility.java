package com.devonfw.application.mtsj.usermanagement.logic.impl.helperinterfaces;

import com.devonfw.application.mtsj.usermanagement.dataaccess.api.ResetTokenEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;

public interface UsermanagementUtility {
	
	abstract public String generate_token();

	public void send_reset_mail(UserEntity destination, ResetTokenEntity tokenEntity);
	
	public void send_reset_confirmation(UserEntity destination);
	
	public void send_resettoken_mail(UserEntity destination, ResetTokenEntity tokenEntity);
}
