package com.devonfw.application.mtsj.usermanagement.logic.impl;

import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.devonfw.application.mtsj.general.logic.base.AbstractComponentFacade;
import com.devonfw.application.mtsj.mailservice.logic.api.Mail;
import com.devonfw.application.mtsj.usermanagement.common.api.to.UserEto;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.ResetTokenEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;
import com.devonfw.application.mtsj.usermanagement.logic.impl.helperinterfaces.UsermanagementUtility;

@Named
@Transactional
public class UsermanagementUtilityImpl implements UsermanagementUtility {

	/*
	 * Duration how long reset token is valid
	 */
	private final static int durationTimeToExpire = 120; // minutes

	@Inject
	private Mail mailService;

	public UsermanagementUtilityImpl() {
		super();
	}

	/*
	 * Generate a new token with 8 characters, contains numbers and alphabets (a-f)
	 */
	@Override
	public String generate_token() {
		return RandomStringUtils.random(8, "0123456789abcdef");
	}

	/*
	 * Sending requested email to an user with token url to reset the password
	 *
	 * @param User of the {@link UserEntity} as destination,
	 * @param ResetTokenEntity of the {@link ResetTokenEntity} for token information,
	 */
	@Override
	public void send_resettoken_mail(UserEntity destination, ResetTokenEntity tokenEntity) {
		try {
			StringBuilder hostMailContent = new StringBuilder();

			hostMailContent.append("MY THAI STAR").append("\n");
			hostMailContent.append("Hi ").append(destination.getUsername()).append("\n");
			hostMailContent.append("You have requested a password reset.").append("\n");

			hostMailContent.append("To change your password, please use the following link:").append("\n");
			String resetLink = "http://localhost:4200/authorizeResettoken?token=" + tokenEntity.getToken();
			hostMailContent.append(resetLink).append("\n");

			System.out.println("\n Email : " + destination.getEmail());
			System.out.println(hostMailContent.toString());

			// Sending Email
			this.mailService.sendMail(destination.getEmail(), "Password Reset-Request", hostMailContent.toString());

		} catch (Exception e) {
			System.out.println("Mail not sent - Error in UsermanagementUtility.class. {}" + e.getMessage());
		}
	}

	/*
	 * Sending requested email to an user with url to reset the password
	 *
	 * @param User of the {@link UserEntity} as destination,
	 * @param ResetTokenEntity of the {@link ResetTokenEntity} for token information,
	 */
	@Override
	public void send_reset_mail(UserEntity destination, ResetTokenEntity tokenEntity) {
		try {
			StringBuilder hostMailContent = new StringBuilder();

			hostMailContent.append("MY THAI STAR").append("\n");
			hostMailContent.append("Hi ").append(destination.getUsername()).append("\n");
			hostMailContent.append("You have requested a password reset.").append("\n");

			hostMailContent.append("Please use following code to reset your password:").append("\n");
			hostMailContent.append(tokenEntity.getToken()).append("\n");

			hostMailContent.append("To change your password, please use the following link:").append("\n");
			String resetLink = getClientUrl() + "/user/reset/password/new/";
			hostMailContent.append(resetLink).append("\n");

			System.out.println("\n Email : " + destination.getEmail());
			System.out.println(hostMailContent.toString());

			// Sending Email
			this.mailService.sendMail(destination.getEmail(), "Password Reset-Request", hostMailContent.toString());

		} catch (Exception e) {
			System.out.println("Mail not sent - Error in UsermanagementUtility.class. {}" + e.getMessage());
		}
	}

	/*
	 * Sending confirmation email to an user that password was changed
	 *
	 * @param User of the {@link UserEntity} as destination
	 */
	@Override
	public void send_reset_confirmation(UserEntity destination) {
		try {
			StringBuilder hostMailContent = new StringBuilder();

			hostMailContent.append("MY THAI STAR").append("\n");
			hostMailContent.append("Hi ").append(destination.getUsername()).append("\n");
			hostMailContent.append("You have changed your password.").append("\n");

			hostMailContent.append("If you dont have changed your password, please contact the owner of the Site.")
					.append("\n");

			System.out.println("\n Email : " + destination.getEmail());
			System.out.println(hostMailContent.toString());

			// Sending Email
			this.mailService.sendMail(destination.getEmail(), "Password Reset successful", hostMailContent.toString());

		} catch (Exception e) {
			System.out.println("Mail not sent - Error in UsermanagementUtility.class. {}" + e.getMessage());
		}
	}

	private static String getClientUrl() {

		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
				.getRequest();
		String clientUrl = request.getHeader("origin");
		if (clientUrl == null) {
			return "http://localhost:8081";
		}
		return clientUrl;
	}

	public int getTimeToExpired() {
		return durationTimeToExpire;
	}
}
