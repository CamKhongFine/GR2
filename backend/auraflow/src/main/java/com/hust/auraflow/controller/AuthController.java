package com.hust.auraflow.controller;

import com.hust.auraflow.common.Config;
import com.hust.auraflow.dto.InviteRequestDTO;
import com.hust.auraflow.dto.InviteResponse;
import com.hust.auraflow.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/invite")
    public ResponseEntity<InviteResponse> inviteUser(@Valid @RequestBody InviteRequestDTO request) {
        try {
            InviteResponse response = authService.inviteUser(request);
            return ResponseEntity.accepted().body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new InviteResponse(e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public void callback(
            @RequestParam("code") String code,
            HttpServletRequest request,
            HttpServletResponse response) throws java.io.IOException {
        try {

            String scheme = request.getScheme();
            String host = request.getHeader("Host");
            String contextPath = request.getContextPath();
            String redirectUri = scheme + "://" + host + contextPath + "/api/auth/callback";
            
            String sessionId = authService.handleKeycloakCallback(code, redirectUri);

            boolean isSecure = "https".equalsIgnoreCase(scheme);
            ResponseCookie sessionCookie = ResponseCookie.from("AURAFLOW_SESSION", sessionId)
                    .httpOnly(true)
                    .secure(isSecure)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(86400) // 24 hours
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, sessionCookie.toString());

            String redirectPath = Config.REDIRECT_URL;
            String frontendUrl = Config.FRONTEND_URL;

            response.sendRedirect(frontendUrl + redirectPath);
        } catch (IllegalStateException e) {
            log.error("Callback failed with IllegalStateException: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Callback failed with unexpected error", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}

