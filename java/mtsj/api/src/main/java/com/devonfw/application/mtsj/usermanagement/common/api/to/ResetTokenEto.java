package com.devonfw.application.mtsj.usermanagement.common.api.to;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.devonfw.module.basic.common.api.to.AbstractEto;

/**
 * Entity transport object of ResetTokenEto
 */
public class ResetTokenEto extends AbstractEto {

	private static final long serialVersionUID = 1L;

	private String token;
	
	private String password;

	private PasswordEncoder myEncoder = new PasswordEncoder() {

		@Override
		public boolean matches(CharSequence rawPassword, String encodedPassword) {
			return (new BCryptPasswordEncoder().encode(rawPassword) == encodedPassword ? true : false);
		}

		@Override
		public String encode(CharSequence rawPassword) {
			return "{bcrypt}" + new BCryptPasswordEncoder().encode(rawPassword);
		}
	};
	
	public void setPassword(String password) {
		this.password = myEncoder.encode(password);
	}
	
	public String getToken() {
		return this.token;
	}
	
	public void setToken(String token) {
		this.token = token;
	}

	public String getPassword() {
		return password;
	}
	
}
