--
-- PostgreSQL database dump
--

\restrict TvsPKyLTHD6DkeDqHecaMowPQEsF9HWbJX1qtpz3HcVY15suyPOhYig3EzJ94cp

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: autodiagnostix
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public.enum_orders_status OWNER TO autodiagnostix;

--
-- Name: enum_products_badge; Type: TYPE; Schema: public; Owner: autodiagnostix
--

CREATE TYPE public.enum_products_badge AS ENUM (
    'NEW',
    'TRENDING',
    'DISCONTINUED'
);


ALTER TYPE public.enum_products_badge OWNER TO autodiagnostix;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: autodiagnostix
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'editor'
);


ALTER TYPE public.enum_users_role OWNER TO autodiagnostix;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.brands (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    logo_id integer,
    website character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brands OWNER TO autodiagnostix;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.categories (
    id character varying NOT NULL,
    name character varying NOT NULL,
    tagline character varying,
    description character varying,
    icon character varying,
    image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO autodiagnostix;

--
-- Name: media; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying,
    caption character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric,
    sizes_thumbnail_url character varying,
    sizes_thumbnail_width numeric,
    sizes_thumbnail_height numeric,
    sizes_thumbnail_mime_type character varying,
    sizes_thumbnail_filesize numeric,
    sizes_thumbnail_filename character varying,
    sizes_medium_url character varying,
    sizes_medium_width numeric,
    sizes_medium_height numeric,
    sizes_medium_mime_type character varying,
    sizes_medium_filesize numeric,
    sizes_medium_filename character varying,
    sizes_large_url character varying,
    sizes_large_width numeric,
    sizes_large_height numeric,
    sizes_large_mime_type character varying,
    sizes_large_filesize numeric,
    sizes_large_filename character varying
);


ALTER TABLE public.media OWNER TO autodiagnostix;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO autodiagnostix;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    total numeric NOT NULL,
    status public.enum_orders_status DEFAULT 'pending'::public.enum_orders_status,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO autodiagnostix;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO autodiagnostix;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: orders_items; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.orders_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity numeric NOT NULL,
    price numeric NOT NULL
);


ALTER TABLE public.orders_items OWNER TO autodiagnostix;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    content jsonb,
    meta_title character varying,
    meta_description character varying,
    hero_image_id integer,
    published boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pages OWNER TO autodiagnostix;

--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pages_id_seq OWNER TO autodiagnostix;

--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);


ALTER TABLE public.payload_kv OWNER TO autodiagnostix;

--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_kv_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_locked_documents OWNER TO autodiagnostix;

--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_locked_documents_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer,
    products_id character varying,
    categories_id character varying,
    media_id integer,
    brands_id character varying,
    pages_id integer,
    orders_id integer
);


ALTER TABLE public.payload_locked_documents_rels OWNER TO autodiagnostix;

--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_migrations OWNER TO autodiagnostix;

--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_migrations_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payload_preferences OWNER TO autodiagnostix;

--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_preferences_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);


ALTER TABLE public.payload_preferences_rels OWNER TO autodiagnostix;

--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNER TO autodiagnostix;

--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.products (
    id character varying NOT NULL,
    name character varying NOT NULL,
    summary character varying,
    description jsonb,
    brand_id character varying NOT NULL,
    category_id character varying NOT NULL,
    badge public.enum_products_badge,
    price numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO autodiagnostix;

--
-- Name: products_features; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.products_features (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    image_id integer
);


ALTER TABLE public.products_features OWNER TO autodiagnostix;

--
-- Name: products_hero_images; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.products_hero_images (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    image_id integer NOT NULL
);


ALTER TABLE public.products_hero_images OWNER TO autodiagnostix;

--
-- Name: products_specs; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.products_specs (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    value character varying
);


ALTER TABLE public.products_specs OWNER TO autodiagnostix;

--
-- Name: products_technical_table; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.products_technical_table (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    label character varying NOT NULL,
    value character varying NOT NULL
);


ALTER TABLE public.products_technical_table OWNER TO autodiagnostix;

--
-- Name: users; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying,
    role public.enum_users_role DEFAULT 'editor'::public.enum_users_role,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


ALTER TABLE public.users OWNER TO autodiagnostix;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: autodiagnostix
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO autodiagnostix;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: autodiagnostix
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: autodiagnostix
--

CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.users_sessions OWNER TO autodiagnostix;

--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.brands (id, name, description, logo_id, website, updated_at, created_at) FROM stdin;
launch	LAUNCH	\N	\N	\N	2026-06-01 09:54:06.957+00	2026-06-01 09:54:06.956+00
smartsafe	SMARTSAFE	\N	\N	\N	2026-06-01 09:54:07.063+00	2026-06-01 09:54:06.907+00
launch-smartsafe	LAUNCH/SMARTSAFE	\N	\N	\N	2026-06-01 09:54:07.095+00	2026-06-01 09:54:07.095+00
autool	AUTOOL	\N	\N	\N	2026-06-01 09:54:07.129+00	2026-06-01 09:54:07.128+00
unite	UNITE	\N	\N	\N	2026-06-01 09:54:07.164+00	2026-06-01 09:54:07.163+00
liberty-lift	LIBERTY LIFT	\N	\N	\N	2026-06-01 09:54:07.194+00	2026-06-01 09:54:07.194+00
gtitools	GTI.TOOLS	\N	\N	\N	2026-06-01 09:54:07.224+00	2026-06-01 09:54:07.224+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.categories (id, name, tagline, description, icon, image_id, updated_at, created_at) FROM stdin;
adas-calibration-tools	ADAS Calibration Tools	Professional ADAS Calibration Solutions	High-quality ADAS calibration equipment for automotive workshops and service centers.	radar	\N	2026-06-01 12:54:19.546+00	2026-06-01 12:54:19.546+00
injector-cleaners-testers	Injector Cleaners & Testers	Professional Fuel System Solutions	Professional injector cleaning and testing equipment for automotive workshops.	oil_barrel	\N	2026-06-01 12:54:19.583+00	2026-06-01 12:54:19.583+00
videoscopes	Videoscopes	Professional Inspection Solutions	High-quality videoscopes and inspection cameras for automotive diagnostics.	videocam	\N	2026-06-01 12:54:19.611+00	2026-06-01 12:54:19.611+00
battery-testers	Battery Testers	Professional Battery Solutions	Professional battery testing equipment for automotive workshops.	battery_full	\N	2026-06-01 12:54:19.639+00	2026-06-01 12:54:19.639+00
ac-service-equipment	AC Service Equipment	Professional AC Solutions	Professional air conditioning service equipment for automotive workshops.	ac_unit	\N	2026-06-01 12:54:19.672+00	2026-06-01 12:54:19.672+00
spark-plug-testers	Spark Plug Testers	Professional Ignition Solutions	Professional spark plug testing equipment for automotive diagnostics.	bolt	\N	2026-06-01 12:54:19.698+00	2026-06-01 12:54:19.698+00
tpms-tools	TPMS Tools	Professional TPMS Solutions	Professional TPMS service tools for automotive workshops.	speed	\N	2026-06-01 12:54:19.727+00	2026-06-01 12:54:19.726+00
wheel-aligners	Wheel Aligners	Professional Alignment Solutions	High-quality wheel alignment equipment for automotive workshops.	swap_horiz	\N	2026-06-01 12:54:19.769+00	2026-06-01 12:54:19.769+00
wheel-balancers	Wheel Balancers	Professional Balancing Solutions	Professional wheel balancing equipment for automotive workshops.	balance	\N	2026-06-01 12:54:19.805+00	2026-06-01 12:54:19.805+00
jacks-lifts	Jacks & Lifts	Professional Lifting Solutions	Professional jacks and lifting equipment for automotive workshops.	vertical_align_top	\N	2026-06-01 12:54:19.833+00	2026-06-01 12:54:19.833+00
diagnostic-scanners	Diagnostic Scanners	Professional Diagnostic Solutions	Professional diagnostic scanners for automotive workshops and service centers.	qr_code_scanner	\N	2026-06-01 12:54:19.864+00	2026-06-01 12:54:19.864+00
car-lifts	Car Lifts	Professional Workshop Solutions	Professional car lifts for automotive workshops and service centers.	garage	\N	2026-06-01 12:54:19.895+00	2026-06-01 12:54:19.895+00
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.media (id, alt, caption, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y, sizes_thumbnail_url, sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type, sizes_thumbnail_filesize, sizes_thumbnail_filename, sizes_medium_url, sizes_medium_width, sizes_medium_height, sizes_medium_mime_type, sizes_medium_filesize, sizes_medium_filename, sizes_large_url, sizes_large_width, sizes_large_height, sizes_large_mime_type, sizes_large_filesize, sizes_large_filename) FROM stdin;
123	\N	\N	2026-06-02 07:37:22.967+00	2026-06-02 07:37:22.967+00	/api/media/file/3-ton-jack-lh-330-1.jpg	\N	3-ton-jack-lh-330-1.jpg	image/jpeg	113889	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
124	\N	\N	2026-06-02 07:37:26.552+00	2026-06-02 07:37:26.552+00	/api/media/file/3-ton-jack-lh-330-2.jpg	\N	3-ton-jack-lh-330-2.jpg	image/jpeg	115025	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
125	\N	\N	2026-06-02 07:38:06.525+00	2026-06-02 07:38:06.525+00	/api/media/file/crt-511s-v2-1.png	\N	crt-511s-v2-1.png	image/png	79869	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
126	\N	\N	2026-06-02 07:38:07.368+00	2026-06-02 07:38:07.368+00	/api/media/file/crt-511s-v2-2.png	\N	crt-511s-v2-2.png	image/png	153076	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
127	\N	\N	2026-06-02 07:38:07.952+00	2026-06-02 07:38:07.951+00	/api/media/file/crt-511s-v2-3.png	\N	crt-511s-v2-3.png	image/png	118340	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
128	\N	\N	2026-06-02 07:38:08.533+00	2026-06-02 07:38:08.532+00	/api/media/file/crt-511s-v2-4.png	\N	crt-511s-v2-4.png	image/png	246936	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
129	\N	\N	2026-06-02 07:38:08.853+00	2026-06-02 07:38:08.853+00	/api/media/file/crt-511s-v2-5.png	\N	crt-511s-v2-5.png	image/png	121135	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
130	\N	\N	2026-06-02 07:38:38.713+00	2026-06-02 07:38:38.713+00	/api/media/file/adas-prov2-1.png	\N	adas-prov2-1.png	image/png	89062	800	458	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
131	\N	\N	2026-06-02 07:38:44.681+00	2026-06-02 07:38:44.681+00	/api/media/file/ac-519-plus-1.png	\N	ac-519-plus-1.png	image/png	180386	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
132	\N	\N	2026-06-02 07:38:50.609+00	2026-06-02 07:38:50.609+00	/api/media/file/ac-519-1.png	\N	ac-519-1.png	image/png	187288	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
133	\N	\N	2026-06-02 07:38:56.249+00	2026-06-02 07:38:56.249+00	/api/media/file/x861l-1.png	\N	x861l-1.png	image/png	47659	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
134	\N	\N	2026-06-02 07:39:02.596+00	2026-06-02 07:39:02.596+00	/api/media/file/cnc-605a-1.webp	\N	cnc-605a-1.webp	image/webp	11486	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
135	\N	\N	2026-06-02 07:39:07.694+00	2026-06-02 07:39:07.694+00	/api/media/file/ismartvideo400-1.webp	\N	ismartvideo400-1.webp	image/webp	12946	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
136	\N	\N	2026-06-02 07:39:08.311+00	2026-06-02 07:39:08.311+00	/api/media/file/ismartvideo400-2.webp	\N	ismartvideo400-2.webp	image/webp	10842	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
137	\N	\N	2026-06-02 07:39:09.133+00	2026-06-02 07:39:09.133+00	/api/media/file/ismartvideo400-3.webp	\N	ismartvideo400-3.webp	image/webp	16678	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
138	\N	\N	2026-06-02 07:39:09.699+00	2026-06-02 07:39:09.699+00	/api/media/file/ismartvideo400-4.webp	\N	ismartvideo400-4.webp	image/webp	23510	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
139	\N	\N	2026-06-02 07:39:10.194+00	2026-06-02 07:39:10.194+00	/api/media/file/ismartvideo400-5.webp	\N	ismartvideo400-5.webp	image/webp	1318	43	43	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
140	\N	\N	2026-06-02 07:39:17.131+00	2026-06-02 07:39:17.131+00	/api/media/file/autool-spt-360-1.jpg	\N	autool-spt-360-1.jpg	image/jpeg	164809	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
141	\N	\N	2026-06-02 07:39:17.224+00	2026-06-02 07:39:17.224+00	/api/media/file/autool-spt-360-2.jpg	\N	autool-spt-360-2.jpg	image/jpeg	109827	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
142	\N	\N	2026-06-02 07:39:17.385+00	2026-06-02 07:39:17.385+00	/api/media/file/autool-spt-360-3.png	\N	autool-spt-360-3.png	image/png	342415	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
143	\N	\N	2026-06-02 07:39:17.477+00	2026-06-02 07:39:17.477+00	/api/media/file/autool-spt-360-4.jpg	\N	autool-spt-360-4.jpg	image/jpeg	83388	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
144	\N	\N	2026-06-02 07:39:17.561+00	2026-06-02 07:39:17.561+00	/api/media/file/autool-spt-360-5.jpg	\N	autool-spt-360-5.jpg	image/jpeg	82825	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
145	\N	\N	2026-06-02 07:41:45.582+00	2026-06-02 07:41:45.582+00	/api/media/file/vsp-800-1.png	\N	vsp-800-1.png	image/png	91438	580	369	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
146	\N	\N	2026-06-02 07:41:46.192+00	2026-06-02 07:41:46.192+00	/api/media/file/vsp-800-2.png	\N	vsp-800-2.png	image/png	81871	580	369	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
147	\N	\N	2026-06-02 07:41:46.793+00	2026-06-02 07:41:46.793+00	/api/media/file/vsp-800-3.png	\N	vsp-800-3.png	image/png	103854	580	369	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
148	\N	\N	2026-06-02 07:41:47.133+00	2026-06-02 07:41:47.133+00	/api/media/file/vsp-800-4.png	\N	vsp-800-4.png	image/png	108885	580	369	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
149	\N	\N	2026-06-02 07:41:55.882+00	2026-06-02 07:41:55.882+00	/api/media/file/vsp-828-1.png	\N	vsp-828-1.png	image/png	146172	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
150	\N	\N	2026-06-02 07:41:56.458+00	2026-06-02 07:41:56.458+00	/api/media/file/vsp-828-2.png	\N	vsp-828-2.png	image/png	122313	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
151	\N	\N	2026-06-02 07:41:57.035+00	2026-06-02 07:41:57.035+00	/api/media/file/vsp-828-3.png	\N	vsp-828-3.png	image/png	193478	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
152	\N	\N	2026-06-02 07:42:04.104+00	2026-06-02 07:42:04.104+00	/api/media/file/bst-360-1.png	\N	bst-360-1.png	image/png	141925	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
153	\N	\N	2026-06-02 07:42:04.713+00	2026-06-02 07:42:04.713+00	/api/media/file/bst-360-2.png	\N	bst-360-2.png	image/png	111530	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
154	\N	\N	2026-06-02 07:42:12.861+00	2026-06-02 07:42:12.861+00	/api/media/file/bst-560s-1.png	\N	bst-560s-1.png	image/png	204640	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
155	\N	\N	2026-06-02 07:42:13.453+00	2026-06-02 07:42:13.453+00	/api/media/file/bst-560s-2.png	\N	bst-560s-2.png	image/png	168368	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
156	\N	\N	2026-06-02 07:42:21.518+00	2026-06-02 07:42:21.518+00	/api/media/file/bst-860s-1.png	\N	bst-860s-1.png	image/png	254509	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
157	\N	\N	2026-06-02 07:42:29.125+00	2026-06-02 07:42:29.125+00	/api/media/file/bst-860s-2.png	\N	bst-860s-2.png	image/png	212051	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
158	\N	\N	2026-06-02 07:42:37.308+00	2026-06-02 07:42:37.307+00	/api/media/file/x613-1.png	\N	x613-1.png	image/png	142752	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
159	\N	\N	2026-06-02 07:42:42.242+00	2026-06-02 07:42:42.242+00	/api/media/file/x613-2.png	\N	x613-2.png	image/png	109649	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
160	\N	\N	2026-06-02 07:42:46.375+00	2026-06-02 07:42:46.375+00	/api/media/file/x613-3.png	\N	x613-3.png	image/png	182132	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
161	\N	\N	2026-06-02 07:42:47.763+00	2026-06-02 07:42:47.763+00	/api/media/file/x613-4.png	\N	x613-4.png	image/png	71926	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
162	\N	\N	2026-06-02 07:42:49.839+00	2026-06-02 07:42:49.839+00	/api/media/file/x613-5.png	\N	x613-5.png	image/png	142455	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
163	\N	\N	2026-06-02 07:42:56.98+00	2026-06-02 07:42:56.98+00	/api/media/file/3-ton-jack-lh-330-3.jpg	\N	3-ton-jack-lh-330-3.jpg	image/jpeg	113889	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
164	\N	\N	2026-06-02 07:42:57.582+00	2026-06-02 07:42:57.582+00	/api/media/file/3-ton-jack-lh-330-4.jpg	\N	3-ton-jack-lh-330-4.jpg	image/jpeg	115025	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
165	\N	\N	2026-06-02 07:43:07.447+00	2026-06-02 07:43:07.447+00	/api/media/file/crp-919-max-1.png	\N	crp-919-max-1.png	image/png	131341	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
166	\N	\N	2026-06-02 07:43:17.073+00	2026-06-02 07:43:17.073+00	/api/media/file/pro-se-2026-model-1.jpg	\N	pro-se-2026-model-1.jpg	image/jpeg	91520	580	369	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
167	\N	\N	2026-06-02 07:43:27.333+00	2026-06-02 07:43:27.333+00	/api/media/file/pro-3-link-1.png	\N	pro-3-link-1.png	image/png	149205	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
168	\N	\N	2026-06-02 07:43:27.933+00	2026-06-02 07:43:27.932+00	/api/media/file/pro-3-link-2.png	\N	pro-3-link-2.png	image/png	111437	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
169	\N	\N	2026-06-02 07:43:28.529+00	2026-06-02 07:43:28.529+00	/api/media/file/pro-3-link-3.png	\N	pro-3-link-3.png	image/png	178973	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
170	\N	\N	2026-06-02 07:43:29.131+00	2026-06-02 07:43:29.131+00	/api/media/file/pro-3-link-4.png	\N	pro-3-link-4.png	image/png	256452	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
171	\N	\N	2026-06-02 07:43:29.472+00	2026-06-02 07:43:29.471+00	/api/media/file/pro-3-link-5.png	\N	pro-3-link-5.png	image/png	103385	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
172	\N	\N	2026-06-02 07:43:42.723+00	2026-06-02 07:43:42.722+00	/api/media/file/pad-9-link-1.png	\N	pad-9-link-1.png	image/png	121395	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
173	\N	\N	2026-06-02 07:43:43.585+00	2026-06-02 07:43:43.585+00	/api/media/file/pad-9-link-2.png	\N	pad-9-link-2.png	image/png	195120	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
174	\N	\N	2026-06-02 07:43:44.2+00	2026-06-02 07:43:44.2+00	/api/media/file/pad-9-link-3.png	\N	pad-9-link-3.png	image/png	210593	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
175	\N	\N	2026-06-02 07:43:44.53+00	2026-06-02 07:43:44.53+00	/api/media/file/pad-9-link-4.png	\N	pad-9-link-4.png	image/png	188932	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
176	\N	\N	2026-06-02 07:43:44.852+00	2026-06-02 07:43:44.852+00	/api/media/file/pad-9-link-5.png	\N	pad-9-link-5.png	image/png	128007	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
177	\N	\N	2026-06-02 07:43:56.527+00	2026-06-02 07:43:56.527+00	/api/media/file/crt-511s-v2-6.png	\N	crt-511s-v2-6.png	image/png	79869	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
178	\N	\N	2026-06-02 07:43:57.398+00	2026-06-02 07:43:57.398+00	/api/media/file/crt-511s-v2-7.png	\N	crt-511s-v2-7.png	image/png	153076	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
179	\N	\N	2026-06-02 07:43:57.729+00	2026-06-02 07:43:57.729+00	/api/media/file/crt-511s-v2-8.png	\N	crt-511s-v2-8.png	image/png	118340	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
180	\N	\N	2026-06-02 07:43:58.332+00	2026-06-02 07:43:58.332+00	/api/media/file/crt-511s-v2-9.png	\N	crt-511s-v2-9.png	image/png	246936	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
181	\N	\N	2026-06-02 07:43:58.708+00	2026-06-02 07:43:58.708+00	/api/media/file/crt-511s-v2-10.png	\N	crt-511s-v2-10.png	image/png	121135	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
182	\N	\N	2026-06-02 07:44:07.444+00	2026-06-02 07:44:07.444+00	/api/media/file/i-tpms-1.png	\N	i-tpms-1.png	image/png	47015	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
183	\N	\N	2026-06-02 07:44:08.026+00	2026-06-02 07:44:08.026+00	/api/media/file/i-tpms-2.png	\N	i-tpms-2.png	image/png	82445	580	580	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
184	\N	\N	2026-06-02 07:44:36.537+00	2026-06-02 07:44:36.537+00	/api/media/file/adas-prov2-2.png	\N	adas-prov2-2.png	image/png	89062	800	458	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
185	\N	\N	2026-06-02 07:44:42.2+00	2026-06-02 07:44:42.2+00	/api/media/file/ac-519-plus-2.png	\N	ac-519-plus-2.png	image/png	180386	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
186	\N	\N	2026-06-02 07:44:48.332+00	2026-06-02 07:44:48.331+00	/api/media/file/ac-519-2.png	\N	ac-519-2.png	image/png	187288	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
187	\N	\N	2026-06-02 07:44:54.04+00	2026-06-02 07:44:54.039+00	/api/media/file/x861l-2.png	\N	x861l-2.png	image/png	47659	679	679	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
188	\N	\N	2026-06-02 07:44:59.919+00	2026-06-02 07:44:59.919+00	/api/media/file/cnc-605a-2.webp	\N	cnc-605a-2.webp	image/webp	11486	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
189	\N	\N	2026-06-02 07:45:04.944+00	2026-06-02 07:45:04.944+00	/api/media/file/ismartvideo400-6.webp	\N	ismartvideo400-6.webp	image/webp	12946	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
190	\N	\N	2026-06-02 07:45:05.172+00	2026-06-02 07:45:05.172+00	/api/media/file/ismartvideo400-7.webp	\N	ismartvideo400-7.webp	image/webp	10842	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
191	\N	\N	2026-06-02 07:45:05.393+00	2026-06-02 07:45:05.393+00	/api/media/file/ismartvideo400-8.webp	\N	ismartvideo400-8.webp	image/webp	16678	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
192	\N	\N	2026-06-02 07:45:05.623+00	2026-06-02 07:45:05.623+00	/api/media/file/ismartvideo400-9.webp	\N	ismartvideo400-9.webp	image/webp	23510	420	420	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
193	\N	\N	2026-06-02 07:45:05.842+00	2026-06-02 07:45:05.842+00	/api/media/file/ismartvideo400-10.webp	\N	ismartvideo400-10.webp	image/webp	1318	43	43	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
194	\N	\N	2026-06-02 07:45:12.626+00	2026-06-02 07:45:12.626+00	/api/media/file/autool-spt-360-3.jpg	\N	autool-spt-360-3.jpg	image/jpeg	164809	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
195	\N	\N	2026-06-02 07:45:12.745+00	2026-06-02 07:45:12.745+00	/api/media/file/autool-spt-360-6.jpg	\N	autool-spt-360-6.jpg	image/jpeg	109827	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
196	\N	\N	2026-06-02 07:45:12.876+00	2026-06-02 07:45:12.876+00	/api/media/file/autool-spt-360-4.png	\N	autool-spt-360-4.png	image/png	342415	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
197	\N	\N	2026-06-02 07:45:13.021+00	2026-06-02 07:45:13.021+00	/api/media/file/autool-spt-360-7.jpg	\N	autool-spt-360-7.jpg	image/jpeg	83388	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
198	\N	\N	2026-06-02 07:45:13.137+00	2026-06-02 07:45:13.137+00	/api/media/file/autool-spt-360-8.jpg	\N	autool-spt-360-8.jpg	image/jpeg	82825	800	800	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
199	\N	\N	2026-06-02 07:47:53.71+00	2026-06-02 07:47:53.71+00	/api/media/file/cnc-605-pro-plus-1.webp	\N	cnc-605-pro-plus-1.webp	image/webp	22538	500	500	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
200	\N	\N	2026-06-02 07:48:00.931+00	2026-06-02 07:48:00.931+00	/api/media/file/x861-pro-1.webp	\N	x861-pro-1.webp	image/webp	32240	1563	1563	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
201	\N	\N	2026-06-02 07:48:28.22+00	2026-06-02 07:48:28.22+00	/api/media/file/uz30c-lift-scissor.webp	\N	uz30c-lift-scissor.webp	image/webp	94122	640	640	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
202	\N	\N	2026-06-02 07:48:28.261+00	2026-06-02 07:48:28.261+00	/api/media/file/uz30c-lift-showcase.webp	\N	uz30c-lift-showcase.webp	image/webp	79488	640	640	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
203	\N	\N	2026-06-02 07:48:28.406+00	2026-06-02 07:48:28.406+00	/api/media/file/g68-wheel-balancer.webp	\N	g68-wheel-balancer.webp	image/webp	223006	1344	768	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
204	\N	\N	2026-06-02 07:48:28.512+00	2026-06-02 07:48:28.512+00	/api/media/file/g55-wheel-balancer.webp	\N	g55-wheel-balancer.webp	image/webp	223006	1344	768	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
205	\N	\N	2026-06-02 07:48:28.633+00	2026-06-02 07:48:28.633+00	/api/media/file/pl-4-2dbs-lift-2post.webp	\N	pl-4-2dbs-lift-2post.webp	image/webp	79488	640	640	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
206	\N	\N	2026-06-02 07:48:28.676+00	2026-06-02 07:48:28.676+00	/api/media/file/pl-4-2dbs-lift-4post.webp	\N	pl-4-2dbs-lift-4post.webp	image/webp	87775	640	640	50	50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.orders (id, customer_name, email, phone, total, status, notes, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: orders_items; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.orders_items (_order, _parent_id, id, product_id, quantity, price) FROM stdin;
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.pages (id, title, slug, content, meta_title, meta_description, hero_image_id, published, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: payload_kv; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_kv (id, key, data) FROM stdin;
\.


--
-- Data for Name: payload_locked_documents; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_locked_documents (id, global_slug, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: payload_locked_documents_rels; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_locked_documents_rels (id, "order", parent_id, path, users_id, products_id, categories_id, media_id, brands_id, pages_id, orders_id) FROM stdin;
\.


--
-- Data for Name: payload_migrations; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_migrations (id, name, batch, updated_at, created_at) FROM stdin;
1	dev	-1	2026-06-01 12:35:48.428+00	2026-06-01 09:53:53.614+00
\.


--
-- Data for Name: payload_preferences; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_preferences (id, key, value, updated_at, created_at) FROM stdin;
1	collection-products	{}	2026-06-01 10:16:31.309+00	2026-06-01 10:16:31.309+00
2	collection-categories	{}	2026-06-02 07:28:45.122+00	2026-06-02 07:28:45.122+00
3	collection-media	{}	2026-06-02 07:28:46.081+00	2026-06-02 07:28:46.081+00
4	collection-brands	{}	2026-06-02 07:28:48.284+00	2026-06-02 07:28:48.284+00
5	collection-pages	{}	2026-06-02 07:28:49.815+00	2026-06-02 07:28:49.815+00
\.


--
-- Data for Name: payload_preferences_rels; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.payload_preferences_rels (id, "order", parent_id, path, users_id) FROM stdin;
1	\N	1	user	1
2	\N	2	user	1
3	\N	3	user	1
4	\N	4	user	1
5	\N	5	user	1
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.products (id, name, summary, description, brand_id, category_id, badge, price, updated_at, created_at) FROM stdin;
ac-519-plus	AC 519+	AC 519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment for fuel, EV, and hybrid vehicles.	"AC519+ is a fully automatic intelligent automobile air-conditioning maintenance equipment suitable for fuel vehicles, pure electric vehicles and hybrid vehicles. Integrates functions such as disassembly-free cleaning, refrigerant recovery, filling, vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF refrigerants. Features 128L/min dual-stage vacuum capacity, 10.1-inch touch screen display, and automatic mode one-click operation."	smartsafe	ac-service-equipment	\N	\N	2026-06-02 07:44:42.495+00	2026-06-01 12:55:46.59+00
ac-519	AC 519	AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment.	"AC519 is a fully automatic intelligent automobile air conditioning maintenance equipment. Integrates disassembly-free cleaning, refrigerant recovery, filling, and vacuuming. Equipped with automobile refrigerant model database, supports R134A or R1234YF."	smartsafe	ac-service-equipment	\N	\N	2026-06-02 07:44:48.66+00	2026-06-01 12:55:46.645+00
cnc-605-pro-plus	CNC 605 PRO+	CNC605+ is a cleaning and testing equipment for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors.	"SmartSafe CNC 605 PRO PLUS is a cleaning and testing equipment suitable for piezoelectric (140V), GDI (65V/12V) and conventional fuel injectors. Uses ultrasonic cleaning technology combined with microprocessor oil pressure control to simulate various engine working conditions."	launch	injector-cleaners-testers	\N	\N	2026-06-02 07:47:53.805+00	2026-06-01 12:55:46.691+00
pl-4-2dbs	PL 4 2DBS	4 Ton 2 Post Clearfloor Lift	"The PL 4 2DBS is a 4 Ton 2 Post Clearfloor Lift by UNITE. Features floor cover plate design, durable construction."	unite	car-lifts	\N	\N	2026-06-02 07:48:28.724+00	2026-06-01 12:55:46.769+00
bst-560s	BST-560S	The LAUNCH plug-to-play battery tester BST-560S is designed for many battery-powered vehicles such as cars, boats, motorcycles more. It's a compact handheld design with LCD display.	"The LAUNCH plug-to-play battery tester BST-560S is designed for many battery-powered vehicles such as cars, boats, motorcycles more. It's a compact handheld design with LCD display."	launch	battery-testers	\N	\N	2026-06-02 07:42:13.517+00	2026-06-01 12:54:38.83+00
x613	X-613 Portable 3D Wheel Aligner	Composed of two magnetic measurement units and four wheel clamp targets, the X-613 is a wireless, ready-to-use four-wheel aligner for repair shops.	"Composed of two magnetic measurement units and four wheel clamp targets, connected via a wireless network, the X-613 is another wireless, ready-to-use four-wheel aligner for repair shops. Unlike traditional 3D wheel aligners, the X-613 eliminates the need for beams and cabinets, pairing with the LAUNCH diagnostic tool(X-431 PAD9/7/5 LINK) to perform precise four-wheel alignment detection. The X-613 supports both standard measurement and quick measurement, including key parameters such as toe, camber, caster, kingpin inclination, and thrust angle, as well as additional measurements including track width, wheelbase, wheel offset, axle offset, diagonal offset, and center offset."	launch	wheel-aligners	\N	\N	2026-06-02 07:42:49.911+00	2026-06-01 12:54:48.886+00
crp-919-max	Creader Professional 919 MAX	The CRP 919 MAX is one of the best choices for entry-level technicians with full system functionality.	"The CRP 919 MAX is one of the best choices for entry-level technicians, featuring all system full functionality for comprehensive diagnostic business."	launch	diagnostic-scanners	\N	\N	2026-06-02 07:43:07.563+00	2026-06-01 12:54:53.39+00
pro-se-2026-model	X-431 PRO SE	Brand-new design with DoIP/CAN FD functions, the X-431 PRO SE will be the best choice for entry-level technicians.	"Brand-new design with DoIP/CAN FD functions, the X-431 PRO SE will be the best choice for entry-level technicians. Upgraded Android 10.0 operation system, 4GB memory and 64GB storage ensure faster and smooth diagnosis."	launch	diagnostic-scanners	\N	\N	2026-06-02 07:43:17.134+00	2026-06-01 12:54:55.813+00
pro-3-link	X-431 PRO3 LINK	The X-431 PRO3 LINK takes dual diagnostic modes (local diagnosis and Smartlink remote diagnosis).	"The X-431 PRO3 LINK takes dual diagnostic modes (local diagnosis and Smartlink remote diagnosis) with expanded diagnostic functions."	launch	diagnostic-scanners	\N	\N	2026-06-02 07:43:29.578+00	2026-06-01 12:54:58.301+00
pad-9-link	LAUNCH X-431 PAD IX LINK	The X-431 PAD9 LINK is a new flagship high-end diagnostic tool with 10x faster scanning.	"The X-431 PAD9 LINK is a new flagship high-end diagnostic tool with SmartLink C V3.0, featuring 10x faster multi-channel scanning."	launch	diagnostic-scanners	\N	\N	2026-06-02 07:43:45.008+00	2026-06-01 12:55:00.724+00
crt-511s-v2	Creader TPMS 511S V2	The Creader TPMS 511S V2 is a standalone TPMS service and programming tool.	"Equipped with Android 8.1, the Creader TPMS 511S V2 is a standalone TPMS service and programming tool with unlimited programming capability."	launch	diagnostic-scanners	\N	\N	2026-06-02 07:43:58.799+00	2026-06-01 12:55:03.54+00
i-tpms	i-TPMS	The i-TPMS provides professional and comprehensive TPMS services for repair shops to develop their TPMS business.	"The i-TPMS provides professional and comprehensive TPMS services for repair shops to develop their TPMS business. It can program LAUNCH LTR RF sensors for unlimited times to replace OE sensors. The sensor data can be read instantly and accurately, including sensor ID, tire pressure, tire temperature, battery status, etc."	launch	tpms-tools	\N	\N	2026-06-02 07:44:08.076+00	2026-06-01 12:55:06.225+00
uz30c	UZ30C	3 Ton Capacity Mid-Rise Scissor Lift by UNITE for automotive workshops.	"The UNITE UZ30C is a 3-ton capacity mid-rise scissor lift designed for automotive workshops. Ideal for tire service, brake work, transmission repair, and under-vehicle inspections. Features durable construction, safety locks, and easy operation."	unite	car-lifts	\N	\N	2026-06-02 07:48:28.338+00	2026-06-01 12:55:07.165+00
vsp-800	VSP-800 Video Scope	VSP800 video scope helps technicians to check issues on unreachable area in a vehicle.	"VSP800 video scope helps technicians to check issues on unreachable area in a vehicle. With 2.7 TFT display for real-time viewing."	launch	videoscopes	\N	\N	2026-06-02 07:41:47.22+00	2026-06-01 12:54:30.49+00
vsp-828	VSP-828	The VSP-828 videoscope is designed for accessing narrow, curved spaces like evaporation boxes, combustion chambers, and three-way catalytic sensors.	"The VSP-828 videoscope is designed for accessing narrow, curved spaces like evaporation boxes, combustion chambers, and three-way catalytic sensors. It captures vivid, clear and multi-angle videos and images, transferring them to a computer or smartphone display via a data cable for versatile inspections. Three versions with varying lens tubes are available for your choice."	launch	videoscopes	\N	\N	2026-06-02 07:41:57.093+00	2026-06-01 12:54:33.082+00
bst-360	BST360 Bluetooth Battery Tester	BST360 is a Bluetooth battery tester safe for technicians and consumers.	"BST360 is a Bluetooth battery tester suitable for technicians and consumers, safe with anti-heat characteristics and spark prevention."	launch	battery-testers	\N	\N	2026-06-02 07:42:04.76+00	2026-06-01 12:54:38.124+00
bst-860s	BST-860S	The LAUNCH plug-to-play battery tester BST-860S is designed for many battery-powered vehicles such as cars, boats, motorcycles, and more. It can quickly detect complete battery system and generate & print the health report within 3 seconds.	"The LAUNCH plug-to-play battery tester BST-860S is designed for many battery-powered vehicles such as cars, boats, motorcycles, and more. It can quickly detect complete battery system and generate & print the health report within 3 seconds."	launch	battery-testers	\N	\N	2026-06-02 07:42:29.23+00	2026-06-01 12:54:39.632+00
3-ton-jack-lh-330	LH-330/LH-340 Dual Pump Floor Jack	The LAUNCH LH330/340 Floor Jack provides Fast Lifting & Smooth Lowering service.	"With the dual pump design and universal joint release mechanism, the LAUNCH LH330/340 Floor Jack provides Fast Lifting & Smooth Lowering service."	launch	jacks-lifts	\N	\N	2026-06-02 07:42:57.639+00	2026-06-01 12:54:50.905+00
adas-prov2	ADAS PRO+V2	ADAS PRO+ V2 is a professional-grade passenger car ADAS calibration device with 75-inch 4K display.	"ADAS PRO+ V2 is a professional-grade passenger car ADAS calibration device equipped with a 75-inch high-definition LCD screen and digital display of front camera targets. Supports more than 30 front camera targets."	smartsafe	adas-calibration-tools	\N	\N	2026-06-02 07:44:36.622+00	2026-06-01 12:54:21.553+00
x861l	X861L	SMARTSAFE WA861 LITE is a stationary 3D wheel aligner using 3D imaging for high-precision tire data.	"SMARTSAFE WA861 LITE uses 3D imaging principle to collect ultra-high-speed and high-precision tire data of vehicles. Classic stationary 3D wheel aligner with 50000+ vehicle database and 10-15cm rolling compensation."	smartsafe	wheel-aligners	\N	\N	2026-06-02 07:44:54.347+00	2026-06-01 12:54:46.202+00
cnc-605a	CNC 605A	CNC605A is a GDI injector cleaner and tester for direct injection fuel systems.	"The CNC605A is a GDI injector cleaner and tester designed specifically for cleaning and testing gasoline direct injection fuel injectors. Features ultrasonic cleaning technology and comprehensive testing functions to maintain optimal fuel system performance."	smartsafe	injector-cleaners-testers	\N	\N	2026-06-02 07:44:59.975+00	2026-06-01 12:54:28.977+00
ismartvideo400	ISMARTVIDEO400	SmartSafe iSmartVideo400 is a professional videoscope for TPMS and vehicle inspections.	"SmartSafe iSmartVideo400 is a professional videoscope designed for TPMS diagnostics and vehicle inspections. Features high-definition imaging, flexible probe, and comprehensive inspection capabilities for hard-to-reach areas in vehicles."	smartsafe	tpms-tools	\N	\N	2026-06-02 07:45:05.898+00	2026-06-01 12:54:36.819+00
autool-spt-360	AUTOOL SPT 360	AUTOOL SPT360 is a car spark plug tester with five-hole flashover analysis.	"The AUTOOL SPT360 Car Spark Plug Tester is an automotive ignition diagnostic tool featuring five-hole spark plug flashover analysis. Works with 110-220V power supply. Tests ignition performance, spark intensity, and detects misfires in gasoline engines."	autool	spark-plug-testers	\N	\N	2026-06-02 07:45:13.21+00	2026-06-01 12:54:45.431+00
x861-pro	X861 PRO	Launch/SmartSafe X861 PRO is an Ultra HD 4-wheel alignment machine with adaptive tracking.	"SMARTSAFE WA861 PRO is an Ultra HD 4-wheel alignment machine. Automatically adjusts beam height according to target height. Features 5MP industrial camera, 50000+ vehicle database, and adaptive tracking system."	launch	wheel-aligners	\N	\N	2026-06-02 07:48:00.99+00	2026-06-01 12:54:47.545+00
g68	G68	UNITE G68 Digital Wheel Balancer with LCD display and precision calibration.	"The UNITE G68 is a digital wheel balancer with LCD display featuring precision calibration, heavy-duty motor, auto-positioning, quick cycle, and durable design. Ideal for professional tire shops and automotive workshops."	unite	wheel-balancers	\N	\N	2026-06-02 07:48:28.458+00	2026-06-01 12:54:49.753+00
g55	G55	UNITE G55 Pro-Line Wheel Balancer for professional tire service.	"The UNITE G55 is a professional wheel balancer designed for automotive workshops requiring precision balancing. Features reliable performance, durable construction, and easy operation for consistent balancing results."	unite	wheel-balancers	\N	\N	2026-06-02 07:48:28.568+00	2026-06-01 12:54:50.285+00
\.


--
-- Data for Name: products_features; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.products_features (_order, _parent_id, id, title, description, image_id) FROM stdin;
1	pro-3-link	6a1d81a584aac3918a3355b9	Multi-Vehicle Support	Enables you to diagnose light, medium & heavy duty vehicles with Smartlink C	\N
2	pro-3-link	6a1d81a584aac3918a3355ba	Extensive Coverage	Full system vehicle coverage for U.S., Asian and European markets over 110 manufacturers	\N
1	adas-prov2	6a1d81a684aac3918a335600	Digital Target Display	Digital display of front camera targets, eliminates installation steps for target head	\N
2	adas-prov2	6a1d81a684aac3918a335601	75-inch 4K Display	Equipped with a 75-inch high-definition LCD screen, 4K resolution	\N
1	ac-519-plus	6a1d815284aac3918a335508	Auto Database	Equipped with automobile refrigerant model database, updated free of charge	\N
2	ac-519-plus	6a1d815284aac3918a335509	Dual Refrigerant Support	Supports R134A or R1234YF	\N
3	ac-519-plus	6a1d815284aac3918a33550a	High Efficiency	128L/min dual-stage vacuum capacity	\N
1	ac-519	6a1d815284aac3918a335515	Auto Database	Equipped with automobile refrigerant model database	\N
2	ac-519	6a1d815284aac3918a335516	Dual Refrigerant	Supports R134A or R1234YF	\N
1	x861l	6a1d81a684aac3918a3355e7	Extensive Database	50000+ global vehicle model database, lifetime free upgrade	\N
2	x861l	6a1d81a684aac3918a3355e8	Rolling Compensation	10-15cm rolling compensation, saving time and effort	\N
1	cnc-605a	6a1d81bb84aac3918a33560e	GDI Cleaning	Specialized cleaning for gasoline direct injection injectors	\N
2	cnc-605a	6a1d81bb84aac3918a33560f	Ultrasonic Technology	Effective ultrasonic cleaning removes carbon deposits	\N
1	ismartvideo400	6a1d81bb84aac3918a33561f	HD Imaging	High-definition camera for clear inspection views	\N
2	ismartvideo400	6a1d81bb84aac3918a335620	Flexible Probe	Flexible probe reaches tight spaces in vehicles	\N
1	autool-spt-360	6a1d81bb84aac3918a335616	Five-Hole Analysis	Five-hole spark plug flashover analyzer for comprehensive ignition testing	\N
2	autool-spt-360	6a1d81bb84aac3918a335617	Universal Power	Works with 110-220V power supply for workshop compatibility	\N
1	vsp-800	6a1d81a584aac3918a33552d	Recording Capability	View, record and save images and videos	\N
2	vsp-800	6a1d81a584aac3918a33552e	Waterproof Camera	IP67 water proof camera head with adjustable intensity LED lights	\N
1	vsp-828	6a1d81a584aac3918a335537	Multiple Lens Options	Three lens versions available: 6.2mm Rotating Lens, 5.5mm Dual-lens, and 5.5mm Standard Version	\N
2	vsp-828	6a1d81a584aac3918a335538	Storage & Recording	4GB built-in storage with support for external TF cards up to 32GB, picture taking and audio/video recording	\N
3	vsp-828	6a1d81a584aac3918a335539	Advanced Features	Flashlight assist, 3x magnification, 4-gear LED light adjustment, image rotation and color switching	\N
1	bst-360	6a1d81a584aac3918a33554e	Real-time Monitoring	Real-time monitor the battery health status	\N
2	bst-360	6a1d81a584aac3918a33554f	Fast Results	Generate health report within 3 seconds	\N
1	bst-560s	6a1d81a584aac3918a335558	Multiple Standards	International measurement standards supported including CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB	\N
2	bst-560s	6a1d81a584aac3918a335559	Comprehensive Testing	6 battery & electrical test functions including Ripple Detection, Battery Test, Electric Current Test, Starter Test, Charging System Test, and Voltage Test	\N
3	bst-560s	6a1d81a584aac3918a33555a	Fast Results	Generate health report within 3 seconds and intuitively display all data on the color screen	\N
1	bst-860s	6a1d81a584aac3918a33556a	Multiple Standards	International measurement standards supported including CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB	\N
2	bst-860s	6a1d81a584aac3918a33556b	Comprehensive Testing	6 battery & electrical test functions including Ripple Detection, Battery Test, Electric Current Test, Starter Test, Charging System Test, and Voltage Test	\N
3	bst-860s	6a1d81a584aac3918a33556c	Fast Results & Printing	Generate health report within 3 seconds and intuitively display all data on the color screen. Reports can be printed anytime by built-in thermal printer	\N
1	pad-9-link	6a1d81a584aac3918a335590	Extensive Coverage	Full system vehicle coverage: 150+ passenger cars, 110+ commercial vehicles, 140+ new energy vehicles	\N
2	pad-9-link	6a1d81a584aac3918a335591	10x Faster Scanning	Multi-channel high-speed scan about 10 times faster	\N
1	cnc-605-pro-plus	6a1d815284aac3918a33551d	Multi-Mode	EFI (12V), GDI (65V) or PIEZO (140V) modes	\N
2	cnc-605-pro-plus	6a1d815284aac3918a33551e	Ultrasonic Cleaning	Simultaneously cleans multiple injectors	\N
3	cnc-605-pro-plus	6a1d815284aac3918a33551f	Comprehensive Testing	Resistance, spray, sealing, and quantity tests	\N
1	x861-pro	6a1d81a684aac3918a3355f1	Extensive Database	50000+ global vehicle model database, lifetime free upgrade	\N
2	x861-pro	6a1d81a684aac3918a3355f2	Ultra HD Camera	5MP industrial camera, adapts to various lighting environments	\N
3	x861-pro	6a1d81a684aac3918a3355f3	Adaptive Tracking	Automatically tracks target and adjusts beam height	\N
1	x613	6a1d81a584aac3918a3355c3	Wireless Ready-to-Use	No wiring required, ready to use by simply screwing targets onto wheel clamps	\N
2	x613	6a1d81a584aac3918a3355c4	Space Saving	No beams or cabinets for preinstallation, ideal for repair shops with limited space	\N
3	x613	6a1d81a584aac3918a3355c5	Extensive Database	Supports alignment data for 50,000+ vehicle models worldwide	\N
1	3-ton-jack-lh-330	6a1d81a584aac3918a33559a	Dual Pump Design	Dual pump design makes the lifting faster	\N
2	3-ton-jack-lh-330	6a1d81a584aac3918a33559b	Universal Joint Release	Universal joint release mechanism allows smoother and more controllable lowering	\N
1	crp-919-max	6a1d81a584aac3918a33557d	Full System Diagnostics	Full system and comprehensive diagnostic functions including DTC, live data, bi-directional control	\N
2	crp-919-max	6a1d81a584aac3918a33557e	98% Vehicle Coverage	Wide OE-level coverage for U.S., Asian and European vehicles, 98%+ vehicle coverage	\N
1	pro-se-2026-model	6a1d81a584aac3918a3355a4	Android 10.0 System	Upgraded Android 10.0 operation system, 4GB memory and 64GB storage ensure faster and smooth diagnosis	\N
2	pro-se-2026-model	6a1d81a584aac3918a3355a5	Advanced VCI	Brand new designed VCI supports even more communication protocols, e.g. CAN, CAN FD, DoIP	\N
3	pro-se-2026-model	6a1d81a584aac3918a3355a6	OE-Level Diagnostics	Full system OE-Level diagnostics on 1996 and newer U.S., European and Asian vehicles	\N
1	crt-511s-v2	6a1d81a584aac3918a335587	99% Coverage	Supports 99% Vehicle Coverage with TPMS-equipped system	\N
2	crt-511s-v2	6a1d81a584aac3918a335588	Full Activation	All 315/433 MHZ Sensors 100% activated	\N
1	i-tpms	6a1d81a584aac3918a3355d6	Unlimited Programming	Program LAUNCH LTR RF sensors for unlimited times to replace OE sensors	\N
2	i-tpms	6a1d81a584aac3918a3355d7	Instant Data Reading	Read sensor data instantly and accurately including ID, pressure, temperature, battery status	\N
1	uz30c	6a1d81ba84aac3918a335606	3 Ton Capacity	Handles most passenger vehicles and light trucks	\N
2	uz30c	6a1d81ba84aac3918a335607	Safety Locks	Built-in safety locking mechanism for secure operation	\N
1	g68	6a1d81bb84aac3918a335627	Digital Display	LCD display for clear readouts and easy operation	\N
2	g68	6a1d81bb84aac3918a335628	Precision Calibration	Accurate wheel balancing with precision calibration system	\N
1	g55	6a1d81bb84aac3918a335631	Professional Grade	Designed for demanding workshop environments	\N
2	g55	6a1d81bb84aac3918a335632	Reliable Performance	Consistent and accurate wheel balancing	\N
\.


--
-- Data for Name: products_hero_images; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.products_hero_images (_order, _parent_id, id, image_id) FROM stdin;
1	vsp-800	6a1e893b84aac3918a3356d2	145
2	vsp-800	6a1e893b84aac3918a3356d3	146
3	vsp-800	6a1e893b84aac3918a3356d4	147
4	vsp-800	6a1e893b84aac3918a3356d5	148
1	vsp-828	6a1e894584aac3918a3356d6	149
2	vsp-828	6a1e894584aac3918a3356d7	150
3	vsp-828	6a1e894584aac3918a3356d8	151
1	bst-360	6a1e894c84aac3918a3356d9	152
2	bst-360	6a1e894c84aac3918a3356da	153
1	bst-560s	6a1e895584aac3918a3356db	154
2	bst-560s	6a1e895584aac3918a3356dc	155
1	bst-860s	6a1e896584aac3918a3356dd	156
2	bst-860s	6a1e896584aac3918a3356de	157
1	x613	6a1e897984aac3918a3356df	158
2	x613	6a1e897984aac3918a3356e0	159
3	x613	6a1e897984aac3918a3356e1	160
4	x613	6a1e897984aac3918a3356e2	161
5	x613	6a1e897984aac3918a3356e3	162
1	3-ton-jack-lh-330	6a1e898184aac3918a3356e4	163
2	3-ton-jack-lh-330	6a1e898184aac3918a3356e5	164
1	crp-919-max	6a1e898b84aac3918a3356e6	165
1	pro-se-2026-model	6a1e899584aac3918a3356e7	166
1	pro-3-link	6a1e89a184aac3918a3356e8	167
2	pro-3-link	6a1e89a184aac3918a3356e9	168
3	pro-3-link	6a1e89a184aac3918a3356ea	169
4	pro-3-link	6a1e89a184aac3918a3356eb	170
5	pro-3-link	6a1e89a184aac3918a3356ec	171
1	pad-9-link	6a1e89b084aac3918a3356ed	172
2	pad-9-link	6a1e89b084aac3918a3356ee	173
3	pad-9-link	6a1e89b084aac3918a3356ef	174
4	pad-9-link	6a1e89b084aac3918a3356f0	175
5	pad-9-link	6a1e89b084aac3918a3356f1	176
1	crt-511s-v2	6a1e89be84aac3918a3356f2	177
2	crt-511s-v2	6a1e89be84aac3918a3356f3	178
3	crt-511s-v2	6a1e89be84aac3918a3356f4	179
4	crt-511s-v2	6a1e89be84aac3918a3356f5	180
5	crt-511s-v2	6a1e89be84aac3918a3356f6	181
1	i-tpms	6a1e89c884aac3918a3356f7	182
2	i-tpms	6a1e89c884aac3918a3356f8	183
1	adas-prov2	6a1e89e484aac3918a3356f9	184
1	ac-519-plus	6a1e89ea84aac3918a3356fa	185
1	ac-519	6a1e89f084aac3918a3356fb	186
1	x861l	6a1e89f684aac3918a3356fc	187
1	cnc-605a	6a1e89fb84aac3918a3356fd	188
1	ismartvideo400	6a1e8a0184aac3918a3356fe	189
2	ismartvideo400	6a1e8a0184aac3918a3356ff	190
3	ismartvideo400	6a1e8a0184aac3918a335700	191
4	ismartvideo400	6a1e8a0184aac3918a335701	192
5	ismartvideo400	6a1e8a0184aac3918a335702	193
1	autool-spt-360	6a1e8a0984aac3918a335703	194
2	autool-spt-360	6a1e8a0984aac3918a335704	195
3	autool-spt-360	6a1e8a0984aac3918a335705	196
4	autool-spt-360	6a1e8a0984aac3918a335706	197
5	autool-spt-360	6a1e8a0984aac3918a335707	198
1	cnc-605-pro-plus	6a1e8aa984aac3918a335708	199
1	x861-pro	6a1e8ab084aac3918a335709	200
1	uz30c	6a1e8acc84aac3918a33570a	201
2	uz30c	6a1e8acc84aac3918a33570b	202
1	g68	6a1e8acc84aac3918a33570c	203
1	g55	6a1e8acc84aac3918a33570d	204
1	pl-4-2dbs	6a1e8acc84aac3918a33570e	205
2	pl-4-2dbs	6a1e8acc84aac3918a33570f	206
\.


--
-- Data for Name: products_specs; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.products_specs (_order, _parent_id, id, value) FROM stdin;
1	pad-9-link	6a1d81a584aac3918a335597	150+ passenger cars, 110+ commercial vehicles, 140+ new energy vehicles
2	pad-9-link	6a1d81a584aac3918a335598	10x faster multi-channel scanning
3	pad-9-link	6a1d81a584aac3918a335599	SmartLink C V3.0
1	cnc-605-pro-plus	6a1d815284aac3918a335525	EFI/GDI/PIEZO mode selection
1	vsp-800	6a1d81a584aac3918a335533	View, record and save images and videos
2	vsp-800	6a1d81a584aac3918a335534	IP67 waterproof camera head
3	vsp-800	6a1d81a584aac3918a335535	2.7 TFT display
4	vsp-800	6a1d81a584aac3918a335536	1280*720 resolution
1	vsp-828	6a1d81a584aac3918a335544	Three lens versions for choice: 6.2mm Rotating Lens Version (RECOMMENDED), 5.5mm Dual-lens Version (Switch between front and side), 5.5mm Standard Version (Single direction)
2	vsp-828	6a1d81a584aac3918a335545	4GB built-in storage on mainboard
3	vsp-828	6a1d81a584aac3918a335546	Support for external TF cards up to 32GB
4	vsp-828	6a1d81a584aac3918a335547	Picture taking & audio/video recording supported
5	vsp-828	6a1d81a584aac3918a335548	Flashlight assist function
6	vsp-828	6a1d81a584aac3918a335549	3 times magnification can be achieved
7	vsp-828	6a1d81a584aac3918a33554a	4-gear LED light for adjustment
8	vsp-828	6a1d81a584aac3918a33554b	Rotate static image in 4 directions
9	vsp-828	6a1d81a584aac3918a33554c	Switch the image between black-and-white and color
10	vsp-828	6a1d81a584aac3918a33554d	High temperature alarm function
1	bst-360	6a1d81a584aac3918a335554	Real-time battery health monitoring
2	bst-360	6a1d81a584aac3918a335555	3-second report generation
3	bst-360	6a1d81a584aac3918a335556	6 test functions
4	bst-360	6a1d81a584aac3918a335557	No heating, no spark
1	bst-560s	6a1d81a584aac3918a335561	International measurement standards supported: CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB
2	bst-560s	6a1d81a584aac3918a335562	6 battery & electrical test functions supported: Ripple Detection, Battery Test, Electric Current Test, Starter Test, Charging System Test, Voltage Test
3	bst-560s	6a1d81a584aac3918a335563	Generate the health report within 3 seconds and intuitively display all data on the color screen
4	bst-560s	6a1d81a584aac3918a335564	Available to the batch inspection of battery by testing continuously and repeatedly
5	bst-560s	6a1d81a584aac3918a335565	Applicable vehicles include car, motorcycles, lawn mowers and other gardening machines, Group 31, commercial vehicles 4D/8D
6	bst-560s	6a1d81a584aac3918a335566	Applicable battery types include 12V: Regular Flooded, Gel Battery, AGM Battery, EFB Battery, Lithium Battery
7	bst-560s	6a1d81a584aac3918a335567	Applicable 12V vehicle's Starter Test and Rectifier Diode Test
8	bst-560s	6a1d81a584aac3918a335568	Safety always comes first. No heating, no discharge, no spark and no operating risks
2	cnc-605-pro-plus	6a1d815284aac3918a335526	Ultrasonic cleaning
3	cnc-605-pro-plus	6a1d815284aac3918a335527	Low/high resistance testing
4	cnc-605-pro-plus	6a1d815284aac3918a335528	Spray uniformity test
5	cnc-605-pro-plus	6a1d815284aac3918a335529	Sealing test
6	cnc-605-pro-plus	6a1d815284aac3918a33552a	Fuel quantity detection
1	x861-pro	6a1d81a684aac3918a3355fa	50000+ global vehicle model database
2	x861-pro	6a1d81a684aac3918a3355fb	5MP industrial camera
3	x861-pro	6a1d81a684aac3918a3355fc	8-12cm rolling compensation
9	bst-560s	6a1d81a584aac3918a335569	Multi-language supported
1	bst-860s	6a1d81a584aac3918a335573	International measurement standards supported: CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB
2	bst-860s	6a1d81a584aac3918a335574	6 battery & electrical test functions supported: Ripple Detection, Battery Test, Electric Current Test, Starter Test, Charging System Test, Voltage Test
3	bst-860s	6a1d81a584aac3918a335575	Generate the health report within 3 seconds and intuitively display all data on the color screen
4	bst-860s	6a1d81a584aac3918a335576	The reports to be printed anytime by built-in thermal printer
5	bst-860s	6a1d81a584aac3918a335577	Available to the batch inspection of battery by testing continuously and repeatedly
6	bst-860s	6a1d81a584aac3918a335578	Applicable vehicles include car, motorcycles, lawn mowers and other gardening machines, Group 31, commercial vehicles 4D/8D
7	bst-860s	6a1d81a584aac3918a335579	Applicable battery types include 12V/24V: Regular Flooded, Gel Battery, AGM Battery, EFB Battery, Lithium Battery
8	bst-860s	6a1d81a584aac3918a33557a	Applicable 12V/24V vehicle's Starter Test and Charging System Test
9	bst-860s	6a1d81a584aac3918a33557b	Safety always comes first. No heating, no discharge, no spark and no operating risks
10	bst-860s	6a1d81a584aac3918a33557c	Multi-language supported
1	x613	6a1d81a584aac3918a3355cd	2 magnetic measurement units + 4 wheel clamp targets
2	x613	6a1d81a584aac3918a3355ce	No wiring required, ready to use
3	x613	6a1d81a584aac3918a3355cf	No beams or cabinets needed
4	x613	6a1d81a584aac3918a3355d0	Supports 50,000+ vehicle models
5	x613	6a1d81a584aac3918a3355d1	Generates results within 30 seconds
6	x613	6a1d81a584aac3918a3355d2	Compatible with X-431 PAD9/7/5 LINK
7	x613	6a1d81a584aac3918a3355d3	Supports both standard and quick measurement
8	x613	6a1d81a584aac3918a3355d4	Measures toe, camber, caster, kingpin inclination, thrust angle
9	x613	6a1d81a584aac3918a3355d5	Additional measurements: track width, wheelbase, wheel offset, axle offset, diagonal offset, center offset
1	3-ton-jack-lh-330	6a1d81a584aac3918a3355a0	Dual pump design
4	x861-pro	6a1d81a684aac3918a3355fd	Adaptive tracking system
5	x861-pro	6a1d81a684aac3918a3355fe	Movable for multi-station sharing
6	x861-pro	6a1d81a684aac3918a3355ff	Four-wheel alignment with standard and quick modes
1	crt-511s-v2	6a1d81a584aac3918a33558d	99% vehicle coverage
2	crt-511s-v2	6a1d81a584aac3918a33558e	All 315/433 MHZ sensors activated
3	crt-511s-v2	6a1d81a584aac3918a33558f	Unlimited LAUNCH sensor programming
1	i-tpms	6a1d81a584aac3918a3355db	Professional and comprehensive TPMS services
2	i-tpms	6a1d81a584aac3918a3355dc	Program LAUNCH LTR RF sensors unlimited times
3	i-tpms	6a1d81a584aac3918a3355dd	Replace OE sensors
4	i-tpms	6a1d81a584aac3918a3355de	Instant and accurate sensor data reading
5	i-tpms	6a1d81a584aac3918a3355df	Read sensor ID, tire pressure, tire temperature, battery status
6	i-tpms	6a1d81a584aac3918a3355e0	Help repair shops develop TPMS business
1	uz30c	6a1d81ba84aac3918a33560a	3 Ton (6,600 lbs) lifting capacity
2	uz30c	6a1d81ba84aac3918a33560b	Mid-rise scissor lift design
3	uz30c	6a1d81ba84aac3918a33560c	Safety locking mechanism
4	uz30c	6a1d81ba84aac3918a33560d	Ideal for tire and brake service
1	g68	6a1d81bb84aac3918a33562c	Digital LCD display
2	g68	6a1d81bb84aac3918a33562d	Precision calibration
3	g68	6a1d81bb84aac3918a33562e	Heavy-duty motor
4	g68	6a1d81bb84aac3918a33562f	Auto-positioning
5	g68	6a1d81bb84aac3918a335630	Quick cycle time
1	g55	6a1d81bb84aac3918a335635	Professional wheel balancing
2	g55	6a1d81bb84aac3918a335636	Durable construction
3	g55	6a1d81bb84aac3918a335637	Easy operation
4	g55	6a1d81bb84aac3918a335638	Consistent balancing results
2	3-ton-jack-lh-330	6a1d81a584aac3918a3355a1	Universal joint release mechanism
3	3-ton-jack-lh-330	6a1d81a584aac3918a3355a2	Low-position design
4	3-ton-jack-lh-330	6a1d81a584aac3918a3355a3	High-quality steel frame
1	crp-919-max	6a1d81a584aac3918a335584	Full system diagnostic functions
2	crp-919-max	6a1d81a584aac3918a335585	98%+ vehicle coverage
3	crp-919-max	6a1d81a584aac3918a335586	Supports CAN/CANFD/DoIP protocols
1	pro-se-2026-model	6a1d81a584aac3918a3355af	Android 10.0 OS, 4GB RAM, 64GB storage
2	pro-se-2026-model	6a1d81a584aac3918a3355b0	Brand new designed VCI supports CAN, CAN FD, DoIP
3	pro-se-2026-model	6a1d81a584aac3918a3355b1	Wireless communication offers flexible and easy connections
1	adas-prov2	6a1d81a684aac3918a335603	75-inch high-definition LCD screen with 4K resolution
2	adas-prov2	6a1d81a684aac3918a335604	Digital display of front camera targets
3	adas-prov2	6a1d81a684aac3918a335605	Supports more than 30 front camera targets
1	ac-519-plus	6a1d815284aac3918a335510	Fully automatic intelligent AC maintenance
2	ac-519-plus	6a1d815284aac3918a335511	Suitable for fuel, EV, and hybrid vehicles
3	ac-519-plus	6a1d815284aac3918a335512	Supports R134A and R1234YF
4	ac-519-plus	6a1d815284aac3918a335513	128L/min dual-stage vacuum pump
5	ac-519-plus	6a1d815284aac3918a335514	10.1-inch touch screen
4	pro-se-2026-model	6a1d81a584aac3918a3355b2	Full system OE-Level diagnostics on 1996 and newer vehicles
5	pro-se-2026-model	6a1d81a584aac3918a3355b3	Full diagnostic functionality includes comprehensive OBD II diagnostics
6	pro-se-2026-model	6a1d81a584aac3918a3355b4	Read/clear DTCs, bi-directional control, remote diagnosis, live data streaming, coding
7	pro-se-2026-model	6a1d81a584aac3918a3355b5	Optional ADAS calibration capability
8	pro-se-2026-model	6a1d81a584aac3918a3355b6	Expand diagnostic coverage via Mall
9	pro-se-2026-model	6a1d81a584aac3918a3355b7	One-stop Info Center includes vehicle repair information
10	pro-se-2026-model	6a1d81a584aac3918a3355b8	Review previous diagnostic report via Diagnostic History
1	pro-3-link	6a1d81a584aac3918a3355c0	Dual diagnostic modes (local and Smartlink remote)
2	pro-3-link	6a1d81a584aac3918a3355c1	Full system vehicle coverage 110+ manufacturers
3	pro-3-link	6a1d81a584aac3918a3355c2	Real-time voltage display
1	ac-519	6a1d815284aac3918a33551a	Equipped with automobile refrigerant model database
2	ac-519	6a1d815284aac3918a33551b	Supports R134A or R1234YF
3	ac-519	6a1d815284aac3918a33551c	Automatic mode one-click operation
1	x861l	6a1d81a684aac3918a3355ed	50000+ global vehicle model database, lifetime free upgrade
2	x861l	6a1d81a684aac3918a3355ee	10-15cm rolling compensation
3	x861l	6a1d81a684aac3918a3355ef	Classic stationary design
4	x861l	6a1d81a684aac3918a3355f0	High-precision 3D measurement
1	cnc-605a	6a1d81bb84aac3918a335612	GDI injector cleaning and testing
2	cnc-605a	6a1d81bb84aac3918a335613	Ultrasonic cleaning technology
3	cnc-605a	6a1d81bb84aac3918a335614	Comprehensive testing functions
4	cnc-605a	6a1d81bb84aac3918a335615	Suitable for direct injection systems
1	ismartvideo400	6a1d81bb84aac3918a335623	Professional videoscope for TPMS diagnostics
2	ismartvideo400	6a1d81bb84aac3918a335624	High-definition imaging
3	ismartvideo400	6a1d81bb84aac3918a335625	Flexible probe design
4	ismartvideo400	6a1d81bb84aac3918a335626	Vehicle inspection capabilities
1	autool-spt-360	6a1d81bb84aac3918a33561b	Five-hole spark plug flashover analysis
2	autool-spt-360	6a1d81bb84aac3918a33561c	110-220V power supply
3	autool-spt-360	6a1d81bb84aac3918a33561d	Ignition performance testing
4	autool-spt-360	6a1d81bb84aac3918a33561e	Detects misfires and spark issues
\.


--
-- Data for Name: products_technical_table; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.products_technical_table (_order, _parent_id, id, label, value) FROM stdin;
1	pad-9-link	6a1d81a584aac3918a335592	OS	Android 13.0
2	pad-9-link	6a1d81a584aac3918a335593	Display	13.6 inch, 2560*1600
3	pad-9-link	6a1d81a584aac3918a335594	CPU	2.0GHz Octa-core
4	pad-9-link	6a1d81a584aac3918a335595	Memory	12GB
1	vsp-800	6a1d81a584aac3918a33552f	LEN O.D.	5.5mm
2	vsp-800	6a1d81a584aac3918a335530	Display Screen	2.7 TFT
3	vsp-800	6a1d81a584aac3918a335531	Tube Length	1000mm
4	vsp-800	6a1d81a584aac3918a335532	Resolution	1280*720
1	vsp-828	6a1d81a584aac3918a33553a	Image Sensor	1/9'' CMOS 720PHD
2	vsp-828	6a1d81a584aac3918a33553b	Frame Rate	30
3	vsp-828	6a1d81a584aac3918a33553c	Diameter	5.5mm single lens tube / 5.5mm dual lens tube / 6.2mm rotating lens tube available
4	vsp-828	6a1d81a584aac3918a33553d	Imaging Focal Length	＞5.5mm
5	vsp-828	6a1d81a584aac3918a33553e	Best Imaging Distance	3-8cm
6	vsp-828	6a1d81a584aac3918a33553f	Tube Length	1m (3m or 5m can be customized)
7	vsp-828	6a1d81a584aac3918a335540	Display Screen	TFT display screen
8	vsp-828	6a1d81a584aac3918a335541	Display Pixels	1280*720
9	vsp-828	6a1d81a584aac3918a335542	Power Supply	Built-in 18650 Lithium battery, 3.7V
10	vsp-828	6a1d81a584aac3918a335543	TF Card Storage	32GB (Optional)
1	bst-360	6a1d81a584aac3918a335550	Battery Types	12V Lead-acid, GEL, AGM
2	bst-360	6a1d81a584aac3918a335551	Standards	CCA, BCI, CA, MCA, JIS, DIN, IEC, EN, SAE, GB
3	bst-360	6a1d81a584aac3918a335552	Test Types	6 kinds of tests
4	bst-360	6a1d81a584aac3918a335553	Report Time	Within 3 seconds
1	bst-560s	6a1d81a584aac3918a33555b	Display	2.4" TFT LCD display with backlight
2	bst-560s	6a1d81a584aac3918a33555c	Working Temperature	-18~60℃
3	bst-560s	6a1d81a584aac3918a33555d	Test Cable	25.98" irreplaceable test cable
4	bst-560s	6a1d81a584aac3918a33555e	Case Material	ABS acid-proof plastic, industrial case design
5	bst-560s	6a1d81a584aac3918a33555f	Dimension	155*85*32(mm)
6	bst-560s	6a1d81a584aac3918a335560	Weight	315g
1	bst-860s	6a1d81a584aac3918a33556d	Display	2.4" TFT LCD display with backlight
2	bst-860s	6a1d81a584aac3918a33556e	Working Temperature	-18~60℃
3	bst-860s	6a1d81a584aac3918a33556f	Test Cable	25.98" irreplaceable test cable
4	bst-860s	6a1d81a584aac3918a335570	Case Material	ABS acid-proof plastic, industrial case design
5	bst-860s	6a1d81a584aac3918a335571	Dimension	195*100*40(mm)
6	bst-860s	6a1d81a584aac3918a335572	Weight	462g
5	pad-9-link	6a1d81a584aac3918a335596	Storage	512GB
1	ac-519	6a1d815284aac3918a335517	Power Supply	AC110V/AC220V 50Hz/60Hz
2	ac-519	6a1d815284aac3918a335518	Recycling Capacity	Gaseous: 400g/min, Liquid: 700g/min
3	ac-519	6a1d815284aac3918a335519	Power	700W
1	x861l	6a1d81a684aac3918a3355e9	Display Accuracy	1'/0.01/0.1mm
2	x861l	6a1d81a684aac3918a3355ea	Toe	±2'
3	x861l	6a1d81a684aac3918a3355eb	Camber	±2'
4	x861l	6a1d81a684aac3918a3355ec	Caster	±4'
1	cnc-605a	6a1d81bb84aac3918a335610	Type	GDI Injector Cleaner & Tester
2	cnc-605a	6a1d81bb84aac3918a335611	Application	Gasoline Direct Injection Systems
1	ismartvideo400	6a1d81bb84aac3918a335621	Type	Videoscope
2	ismartvideo400	6a1d81bb84aac3918a335622	Application	TPMS & Vehicle Inspection
1	autool-spt-360	6a1d81bb84aac3918a335618	Power Supply	110-220V
2	autool-spt-360	6a1d81bb84aac3918a335619	Type	Spark Plug Tester
3	autool-spt-360	6a1d81bb84aac3918a33561a	Application	Automotive Ignition Diagnostics
1	x613	6a1d81a584aac3918a3355c6	Toe Angle	±20°
2	x613	6a1d81a584aac3918a3355c7	Camber Angle	±10°
3	x613	6a1d81a584aac3918a3355c8	Kingpin Castor Angle	±20°
4	x613	6a1d81a584aac3918a3355c9	Kingpin Inclination Angle	±20°
5	x613	6a1d81a584aac3918a3355ca	Track Width	1290~1900 mm
6	x613	6a1d81a584aac3918a3355cb	Wheelbase	1940~4600 mm
7	x613	6a1d81a584aac3918a3355cc	Wheel Hub Diameter	275~640 mm
1	3-ton-jack-lh-330	6a1d81a584aac3918a33559c	LH-340 Capacity	4 Ton/ 8800 LBS/ 4000 KG
2	3-ton-jack-lh-330	6a1d81a584aac3918a33559d	LH-330 Capacity	3 Ton/ 6600 LBS/ 3000KG
3	3-ton-jack-lh-330	6a1d81a584aac3918a33559e	LH-340 Max Height	533mm/ 21 inch
4	3-ton-jack-lh-330	6a1d81a584aac3918a33559f	LH-330 Max Height	500mm/ 19-5/8 inch
1	crp-919-max	6a1d81a584aac3918a33557f	OS	Android 10.0
2	crp-919-max	6a1d81a584aac3918a335580	Display	7", 1024*600
3	crp-919-max	6a1d81a584aac3918a335581	CPU	2.0GHz, Quad-core
4	crp-919-max	6a1d81a584aac3918a335582	RAM	4GB
5	crp-919-max	6a1d81a584aac3918a335583	Storage	64GB
1	pro-se-2026-model	6a1d81a584aac3918a3355a7	OS	Android 10.0
1	crt-511s-v2	6a1d81a584aac3918a335589	OS	Android 8.1
2	crt-511s-v2	6a1d81a584aac3918a33558a	Display	5'', 720P touch screen
3	crt-511s-v2	6a1d81a584aac3918a33558b	Battery	6000mAh
4	crt-511s-v2	6a1d81a584aac3918a33558c	Storage	2+32GB
1	i-tpms	6a1d81a584aac3918a3355d8	Sensor Programming	Unlimited LAUNCH LTR RF sensors
2	i-tpms	6a1d81a584aac3918a3355d9	Data Reading	Sensor ID, pressure, temperature, battery status
3	i-tpms	6a1d81a584aac3918a3355da	Application	TPMS service for repair shops
1	cnc-605-pro-plus	6a1d815284aac3918a335520	Power Supply	AC110V/AC220V 50Hz/60Hz
2	cnc-605-pro-plus	6a1d815284aac3918a335521	Speed Range	100~9900rpm
3	cnc-605-pro-plus	6a1d815284aac3918a335522	Power	500W
4	cnc-605-pro-plus	6a1d815284aac3918a335523	Fuel Tank	2500 ml
5	cnc-605-pro-plus	6a1d815284aac3918a335524	Host Size	412x398x550mm
1	x861-pro	6a1d81a684aac3918a3355f4	Display Accuracy	1'/0.01/0.1mm
2	x861-pro	6a1d81a684aac3918a3355f5	Toe	±2'
3	x861-pro	6a1d81a684aac3918a3355f6	Camber	±2'
4	x861-pro	6a1d81a684aac3918a3355f7	Caster	±4'
5	x861-pro	6a1d81a684aac3918a3355f8	Kingpin Inclination	±6'
6	x861-pro	6a1d81a684aac3918a3355f9	Trust Angle	±2'
2	pro-se-2026-model	6a1d81a584aac3918a3355a8	Display	8", 1280*800
3	pro-se-2026-model	6a1d81a584aac3918a3355a9	CPU	2.0GHz, Quad-Core
4	pro-se-2026-model	6a1d81a584aac3918a3355aa	RAM	4GB
5	pro-se-2026-model	6a1d81a584aac3918a3355ab	Storage	64GB
6	pro-se-2026-model	6a1d81a584aac3918a3355ac	Battery	47.88Wh (7.6V, 6300mAh)
7	pro-se-2026-model	6a1d81a584aac3918a3355ad	Camera	Rear 8MP
8	pro-se-2026-model	6a1d81a584aac3918a3355ae	Dimensions	234*166*39.5 mm
1	pro-3-link	6a1d81a584aac3918a3355bb	OS	Android 10.0
2	pro-3-link	6a1d81a584aac3918a3355bc	Display	10.1", 1920*800
3	pro-3-link	6a1d81a584aac3918a3355bd	CPU	2.0GHz, Quad-core
4	pro-3-link	6a1d81a584aac3918a3355be	Memory	4GB
5	pro-3-link	6a1d81a584aac3918a3355bf	Storage	64GB
1	adas-prov2	6a1d81a684aac3918a335602	Display	75-inch HD LCD, 4K resolution
1	ac-519-plus	6a1d815284aac3918a33550b	Power Supply	AC110V/AC220V 50Hz/60Hz
2	ac-519-plus	6a1d815284aac3918a33550c	Power	1000W
3	ac-519-plus	6a1d815284aac3918a33550d	Vacuum Pump	Dual-stage 128L/min
4	ac-519-plus	6a1d815284aac3918a33550e	Display	10.1-inch touch screen
5	ac-519-plus	6a1d815284aac3918a33550f	Tank Capacity	22kg
1	uz30c	6a1d81ba84aac3918a335608	Capacity	3 Ton / 6,600 lbs
2	uz30c	6a1d81ba84aac3918a335609	Type	Mid-Rise Scissor Lift
1	g68	6a1d81bb84aac3918a335629	Type	Digital Wheel Balancer
2	g68	6a1d81bb84aac3918a33562a	Display	LCD Display
3	g68	6a1d81bb84aac3918a33562b	Motor	Heavy-Duty
1	g55	6a1d81bb84aac3918a335633	Type	Wheel Balancer
2	g55	6a1d81bb84aac3918a335634	Grade	Professional / Pro-Line
1	pl-4-2dbs	6a1d815284aac3918a33552b	Capacity	4 Ton
2	pl-4-2dbs	6a1d815284aac3918a33552c	Type	2 Post Clearfloor
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.users (id, name, role, updated_at, created_at, email, reset_password_token, reset_password_expiration, salt, hash, login_attempts, lock_until) FROM stdin;
1	\N	editor	2026-06-01 09:54:06.208+00	2026-06-01 09:54:06.207+00	admin@autodiagnostix.com	\N	\N	ec73c7cc272a8e1258f8a7585fdb6b95c0c77fdf6be237003ea9b61803cf8724	90138785f87d7f25a598d6114540121c7a29ed7775279e1190e7ed28a359a43ff27e6308e5b4b7eca02f240b8fcdf91a069273f677c16da04352f2205b84877964e1e0e74cc3714f4a5e24fcbbd9045acc1f15c607f5e1dfcda46e6da6bef455a41e7eebeef8a20c0a2272da14d67b89de3e3264db1cbdace359e7ed29f2e1cff67fde08ed8ff4c8c17f12c6b36fe1b9cec96992a6c0f7be2a46740ca439ee322acef331f5f68796dd3b4081e4026906593dd56099888b6da4bba5f9c6ea7ba86f01cc9f9183497aecca387067787885c4fb969904c5753cda6b0c0a1182b29992ba87f108d430ee5283944371bd40964637ca185a64cf54691f62128eca2bfe8289bf8825f9002a940eb40d8e8f9314224ae35660cacdc21c85ca1e4a9f9e1090758f89f203309d4cc67e1031a1d6c7e5f6a2fc4063a9b232e99cf98f1379a42d984640c6a86cae43215a90d5cb429517f967ff5adac2a56b2bfe3147774362150a91108e559cf8ab1a5bb74e84dc239889c6fe375c4a2fb4cec751404aaf6ef44aa6823ad20e968a5ab67998ffca5f5039bd02a6c720b4d0b3a6fafb20e54bbd4fa248d1b11f748a30d942de794033988a6b85309bfb04b2634ac509a27604fe30866965feaa78e644291e1e7c911aed8fc615cd889ad2384bbd7b41057ec43dde091385d8668ec60ebe52e67a2a8d04c608cfc08eaef417ba2fe37d5857c8	0	\N
\.


--
-- Data for Name: users_sessions; Type: TABLE DATA; Schema: public; Owner: autodiagnostix
--

COPY public.users_sessions (_order, _parent_id, id, created_at, expires_at) FROM stdin;
1	1	abc86bdb-020f-4553-ae94-30e8d0481b7d	2026-06-02 06:51:17.24+00	2026-06-02 08:51:17.24+00
2	1	922183a6-02cb-4d86-ae20-c3b7fbbe3910	2026-06-02 06:56:58.882+00	2026-06-02 08:56:58.882+00
3	1	d04ee547-6109-405a-bd13-234d132dd1f7	2026-06-02 06:57:38.733+00	2026-06-02 08:57:38.733+00
4	1	580e4795-8e52-4a70-bd37-969bb52435b8	2026-06-02 07:02:59.818+00	2026-06-02 09:02:59.818+00
5	1	26cf0bd7-cfde-4775-81a0-a8ee282d2c8d	2026-06-02 07:04:35.857+00	2026-06-02 09:04:35.857+00
6	1	862185fc-0f16-4918-8393-a1c3a1b6ac31	2026-06-02 07:04:57.718+00	2026-06-02 09:04:57.718+00
7	1	8345f27e-f347-48c4-b74b-a14787bb7143	2026-06-02 07:20:21.607+00	2026-06-02 09:20:21.607+00
8	1	f6224846-750d-4aae-84a9-a3f3974f3af0	2026-06-02 07:20:30.415+00	2026-06-02 09:20:30.415+00
9	1	eee9c5f6-a82e-41f4-bcc9-10b14148e21d	2026-06-02 07:25:25.977+00	2026-06-02 09:25:25.977+00
10	1	282a2884-4bc6-44b3-9e59-b2ff161c61fe	2026-06-02 07:28:36.128+00	2026-06-02 09:28:36.128+00
11	1	2af50768-f984-4b60-aabd-0205c008120e	2026-06-02 07:29:26.657+00	2026-06-02 09:29:26.657+00
12	1	4d805a5a-2774-467a-adc9-f4beb186bf95	2026-06-02 07:36:19.78+00	2026-06-02 09:36:19.78+00
13	1	901dfd7a-cc23-4d13-a10a-e1c7d14dea3b	2026-06-02 07:41:36.304+00	2026-06-02 09:41:36.304+00
14	1	10117a46-4b47-4469-9ecf-152612f2f8c6	2026-06-02 07:47:44.546+00	2026-06-02 09:47:44.546+00
15	1	cc20a11a-9b52-4755-a754-f7e36ce0f98b	2026-06-02 07:48:28.151+00	2026-06-02 09:48:28.151+00
16	1	5d369d87-62a0-4d59-b971-21243e8312dc	2026-06-02 07:48:34.711+00	2026-06-02 09:48:34.711+00
17	1	681fc1f5-7c3e-434d-a3f3-eabfada89f9a	2026-06-02 07:49:00.101+00	2026-06-02 09:49:00.101+00
\.


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.media_id_seq', 206, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.pages_id_seq', 1, false);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_kv_id_seq', 1, false);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_locked_documents_id_seq', 1, false);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_locked_documents_rels_id_seq', 1, false);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_migrations_id_seq', 1, true);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_preferences_id_seq', 5, true);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.payload_preferences_rels_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: autodiagnostix
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: orders_items orders_items_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.orders_items
    ADD CONSTRAINT orders_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: products_features products_features_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_features
    ADD CONSTRAINT products_features_pkey PRIMARY KEY (id);


--
-- Name: products_hero_images products_hero_images_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_hero_images
    ADD CONSTRAINT products_hero_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products_specs products_specs_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_specs
    ADD CONSTRAINT products_specs_pkey PRIMARY KEY (id);


--
-- Name: products_technical_table products_technical_table_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_technical_table
    ADD CONSTRAINT products_technical_table_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);


--
-- Name: brands_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX brands_created_at_idx ON public.brands USING btree (created_at);


--
-- Name: brands_logo_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX brands_logo_idx ON public.brands USING btree (logo_id);


--
-- Name: brands_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX brands_updated_at_idx ON public.brands USING btree (updated_at);


--
-- Name: categories_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX categories_created_at_idx ON public.categories USING btree (created_at);


--
-- Name: categories_image_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX categories_image_idx ON public.categories USING btree (image_id);


--
-- Name: categories_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX categories_updated_at_idx ON public.categories USING btree (updated_at);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_sizes_large_sizes_large_filename_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX media_sizes_large_sizes_large_filename_idx ON public.media USING btree (sizes_large_filename);


--
-- Name: media_sizes_medium_sizes_medium_filename_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX media_sizes_medium_sizes_medium_filename_idx ON public.media USING btree (sizes_medium_filename);


--
-- Name: media_sizes_thumbnail_sizes_thumbnail_filename_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX media_sizes_thumbnail_sizes_thumbnail_filename_idx ON public.media USING btree (sizes_thumbnail_filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_items_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX orders_items_order_idx ON public.orders_items USING btree (_order);


--
-- Name: orders_items_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX orders_items_parent_id_idx ON public.orders_items USING btree (_parent_id);


--
-- Name: orders_items_product_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX orders_items_product_idx ON public.orders_items USING btree (product_id);


--
-- Name: orders_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX orders_updated_at_idx ON public.orders USING btree (updated_at);


--
-- Name: pages_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX pages_created_at_idx ON public.pages USING btree (created_at);


--
-- Name: pages_hero_image_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX pages_hero_image_idx ON public.pages USING btree (hero_image_id);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE UNIQUE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: pages_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX pages_updated_at_idx ON public.pages USING btree (updated_at);


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_brands_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_brands_id_idx ON public.payload_locked_documents_rels USING btree (brands_id);


--
-- Name: payload_locked_documents_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_categories_id_idx ON public.payload_locked_documents_rels USING btree (categories_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_orders_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_orders_id_idx ON public.payload_locked_documents_rels USING btree (orders_id);


--
-- Name: payload_locked_documents_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_pages_id_idx ON public.payload_locked_documents_rels USING btree (pages_id);


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_products_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_products_id_idx ON public.payload_locked_documents_rels USING btree (products_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: products_brand_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_brand_idx ON public.products USING btree (brand_id);


--
-- Name: products_category_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_category_idx ON public.products USING btree (category_id);


--
-- Name: products_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_created_at_idx ON public.products USING btree (created_at);


--
-- Name: products_features_image_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_features_image_idx ON public.products_features USING btree (image_id);


--
-- Name: products_features_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_features_order_idx ON public.products_features USING btree (_order);


--
-- Name: products_features_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_features_parent_id_idx ON public.products_features USING btree (_parent_id);


--
-- Name: products_hero_images_image_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_hero_images_image_idx ON public.products_hero_images USING btree (image_id);


--
-- Name: products_hero_images_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_hero_images_order_idx ON public.products_hero_images USING btree (_order);


--
-- Name: products_hero_images_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_hero_images_parent_id_idx ON public.products_hero_images USING btree (_parent_id);


--
-- Name: products_specs_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_specs_order_idx ON public.products_specs USING btree (_order);


--
-- Name: products_specs_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_specs_parent_id_idx ON public.products_specs USING btree (_parent_id);


--
-- Name: products_technical_table_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_technical_table_order_idx ON public.products_technical_table USING btree (_order);


--
-- Name: products_technical_table_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_technical_table_parent_id_idx ON public.products_technical_table USING btree (_parent_id);


--
-- Name: products_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX products_updated_at_idx ON public.products USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: autodiagnostix
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: brands brands_logo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_logo_id_media_id_fk FOREIGN KEY (logo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories categories_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: orders_items orders_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.orders_items
    ADD CONSTRAINT orders_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders_items orders_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.orders_items
    ADD CONSTRAINT orders_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: pages pages_hero_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_hero_image_id_media_id_fk FOREIGN KEY (hero_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_brands_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_brands_fk FOREIGN KEY (brands_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_orders_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_orders_fk FOREIGN KEY (orders_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: products_features products_features_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_features
    ADD CONSTRAINT products_features_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: products_features products_features_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_features
    ADD CONSTRAINT products_features_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_hero_images products_hero_images_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_hero_images
    ADD CONSTRAINT products_hero_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: products_hero_images products_hero_images_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_hero_images
    ADD CONSTRAINT products_hero_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_specs products_specs_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_specs
    ADD CONSTRAINT products_specs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_technical_table products_technical_table_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.products_technical_table
    ADD CONSTRAINT products_technical_table_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: autodiagnostix
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TvsPKyLTHD6DkeDqHecaMowPQEsF9HWbJX1qtpz3HcVY15suyPOhYig3EzJ94cp

