package com.hust.auraflow.security;

import com.hust.auraflow.dto.SessionData;
import com.hust.auraflow.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final String SESSION_COOKIE = "AURAFLOW_SESSION";
    private static final String CALLBACK_PATH = "/api/auth/callback";
    private static final String LOGOUT_PATH = "/api/auth/logout";

    private final SessionService sessionService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith(CALLBACK_PATH) || path.startsWith(LOGOUT_PATH);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String sessionId = resolveSessionId(request);
            if (sessionId != null) {
                SessionData sessionData = sessionService.getSession(sessionId);
                if (sessionData != null) {
                    UserPrincipal principal = UserPrincipal.builder()
                            .userId(sessionData.getUserId())
                            .tenantId(sessionData.getTenantId())
                            .roleIds(sessionData.getRoleIds())
                            .build();

                    Set<SimpleGrantedAuthority> authorities = sessionData.getRoleIds().stream()
                            .filter(Objects::nonNull)
                            .map(id -> new SimpleGrantedAuthority("ROLE_" + id))
                            .collect(Collectors.toSet());

                    var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String resolveSessionId(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> SESSION_COOKIE.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}


