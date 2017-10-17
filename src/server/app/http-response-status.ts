export enum HttpStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS,
    PROCESSING,

    OK = 200,
    CREATED,
    ACCEPTED,
    NON_AUTHORITATIVE_INFORMATION,
    NO_CONTENT,
    RESET_CONTENT,
    PARTIAL_CONTENT,
    MULTI_STATUS,
    ALREADY_REPORTED,
    CONTENT_DIFFERENT = 210,
    IM_USED = 226,

    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY,
    MOVED_TEMPORARLY,
    SEE_OTHERS,
    NOT_MODIFIED,
    USE_PROXY,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT,
    TOO_MANY_REDIRECTS = 310,

    BAD_REQUEST = 400,
    UNAUTHORIZED,
    PAYMENT_REQUIRED,
    FORBIDDEN,
    NOT_FOUND,
    METHOD_NOT_ALLOWED,
    NOT_ACCEPTABLE,
    PROXY_AUTHENTICATION_REQUIRED,
    REQUEST_TIMEOUT,
    CONFLICT,
    GONE,
    LENGTH_REQUIRED,
    PRECONDITION_FAILED,
    REQUEST_ENTITY_TOO_LARGE,
    REQUEST_URI_TOO_LONG,
    UNSUPPORTED_MEDIA_TYPE,
    REQUESTED_RANGE_UNSATISFIABLE,
    EXPECTATION_FAILED,
    IM_A_TEAPOT,
    BAD_MAPPING = 421,
    UNPROCESSABLE_ENTITY,
    LOCKED,
    METHOD_FAILURE,
    UNORDERED_COLLECTION,
    UPGRADE_REQUIRED,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    NO_RESPONSE = 444,

    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED,
    BAD_GATEWAY,
    SERVICE_UNAVAILABLE,
    GATEWAY_TIMEOUT,
    HTTP_VERSION_NOT_SUPPORTED,
    VARIANT_ALSO_NAGOTIATES,
    INSUFFICIENT_STORAGE,
    LOOP_DETECTED,
    BANDWIDTH_LIMIT_EXCEEDED,
    NOT_EXTENDED,
    NETWORK_AUTHENTICATION_REQUIRED,
    UNKNOWN_ERROR = 520,
    WEB_SERVER_IS_DOWN,
    CONNECTION_TIMED_OUT,
    ORIGIN_IS_UNREACHABLE,
    TIMEOUT_OCCURED,
    SSL_HANDSHAKE_FAILED,
    INVALID_SSL_CERTIFICATE,
    RAILGUN_ERROR
}

export default HttpStatus;

export function getStatusOrDefault(status: any): HttpStatus {
    if (status in HttpStatus) {
        return status;
    }
    else {
        console.warn(new Error('Status is not a HttpStatus instance.'));
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}