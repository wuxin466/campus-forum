package com.campus.forum.config;
import org.springframework.amqp.core.Queue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class InfrastructureConfig {
    public static final String NOTIFICATION_QUEUE = "campus.notification.create";
    @Bean @ConditionalOnProperty(name="campus.infrastructure.rabbit-enabled", havingValue="true")
    Queue notificationQueue() { return new Queue(NOTIFICATION_QUEUE, true); }
}
