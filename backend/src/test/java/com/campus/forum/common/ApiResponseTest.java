package com.campus.forum.common;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class ApiResponseTest {
    @Test
    void successUsesFrontendContract() {
        ApiResponse<String> response = ApiResponse.success("ok");
        assertThat(response.code()).isEqualTo(200);
        assertThat(response.msg()).isEqualTo("操作成功");
        assertThat(response.data()).isEqualTo("ok");
    }
}
