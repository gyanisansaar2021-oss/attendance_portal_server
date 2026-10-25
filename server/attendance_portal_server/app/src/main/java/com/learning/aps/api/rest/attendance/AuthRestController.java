package com.learning.aps.api.rest.attendance;

import com.learning.aps.domain.attendance.AuthManager;
import com.learning.aps.dto.OtpResponse;
import com.learning.aps.dto.OtpSendRequest;
import com.learning.aps.dto.OtpVerifyRequest;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/otp")
@RequiredArgsConstructor
public class AuthRestController {

  private final AuthManager authManager;

  @PostMapping("/send")
  public CompletableFuture<ResponseEntity<OtpResponse>> sendOtp(
      @RequestBody OtpSendRequest request) {
    return authManager.sendOtp(request)
        .thenApply(response -> response.isSuccess()
            ? ResponseEntity.ok(response)
            : ResponseEntity.badRequest().body(response));
  }

  @PostMapping("/verify")
  public CompletableFuture<ResponseEntity<OtpResponse>> verifyOtp(
      @RequestBody OtpVerifyRequest request) {
    return authManager.verifyOtp(request)
        .thenApply(response -> response.isSuccess()
            ? ResponseEntity.ok(response)
            : ResponseEntity.badRequest().body(response));
  }
}
