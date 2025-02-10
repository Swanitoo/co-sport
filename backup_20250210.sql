--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: swan
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO swan;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: swan
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Plan; Type: TYPE; Schema: public; Owner: swan
--

CREATE TYPE public."Plan" AS ENUM (
    'FREE',
    'PREMIUM'
);


ALTER TYPE public."Plan" OWNER TO swan;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: swan
--

CREATE TYPE public."Status" AS ENUM (
    'PENDING',
    'APPROVED',
    'REMOVED',
    'REFUSED'
);


ALTER TYPE public."Status" OWNER TO swan;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO swan;

--
-- Name: Membership; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."Membership" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    status public."Status" DEFAULT 'PENDING'::public."Status" NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Membership" OWNER TO swan;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    sport text NOT NULL,
    description text NOT NULL,
    level text NOT NULL,
    slug text NOT NULL,
    "venueAddress" text,
    "venueLat" double precision,
    "venueLng" double precision,
    "venueName" text,
    "onlyGirls" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO swan;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    rating integer NOT NULL,
    ip text NOT NULL,
    text text,
    "socialLink" text,
    name text,
    image text,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO swan;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO swan;

--
-- Name: StravaActivity; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."StravaActivity" (
    id text NOT NULL,
    "userId" text NOT NULL,
    activity text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    distance double precision NOT NULL
);


ALTER TABLE public."StravaActivity" OWNER TO swan;

--
-- Name: User; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    plan public."Plan" DEFAULT 'FREE'::public."Plan" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "stripeCustomerId" text,
    "socialLink" text,
    bio text,
    city text,
    country text,
    sex text,
    state text,
    "birthDate" timestamp(3) without time zone,
    nationality text,
    "profileCompleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO swan;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO swan;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO swan;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: swan
--

CREATE TABLE public.messages (
    id text NOT NULL,
    text text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reply_to_id text
);


ALTER TABLE public.messages OWNER TO swan;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."Membership" (id, "userId", "productId", status, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."Product" (id, name, "userId", "createdAt", "updatedAt", enabled, sport, description, level, slug, "venueAddress", "venueLat", "venueLng", "venueName", "onlyGirls") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."Review" (id, rating, ip, text, "socialLink", name, image, "productId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: StravaActivity; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."StravaActivity" (id, "userId", activity, date, distance) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."User" (id, name, email, "emailVerified", image, "createdAt", plan, "updatedAt", "stripeCustomerId", "socialLink", bio, city, country, sex, state, "birthDate", nationality, "profileCompleted") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
86434d87-dbd9-4572-ad6b-bd1fcce9e562	9df02005a87d1b4a4e522b1250734f1427d3a469e775c3632713bda352e150dc	2025-02-10 23:04:09.024717+01	20240418222635_next_auth_initial_migration	\N	\N	2025-02-10 23:04:08.988606+01	1
d13f7c5c-f628-4357-9af2-18cbf03af863	fe9b52b85c9139ae1add8d9634c236f61ee224c2b7007e1c920331a5f0b33e1a	2025-02-10 23:04:09.166287+01	20250210195645_add_message_replies	\N	\N	2025-02-10 23:04:09.159863+01	1
6066576a-e074-4efb-a729-95562e2a2d15	facf7c3f12b4e74a0abc089251d96fe9bba9471b9d27c03f37d894e7fef55b22	2025-02-10 23:04:09.044035+01	20240419202517_product_and_review_initial	\N	\N	2025-02-10 23:04:09.026477+01	1
fef361bd-e057-4169-8569-f507994ca7c3	a78890c4808deebf07a1919cc3a359034f53099e31ae1741675e12e79f64fcc5	2025-02-10 23:04:09.057772+01	20240419204004_product_and_review_initite_table	\N	\N	2025-02-10 23:04:09.045861+01	1
cb01f75e-b82f-44ba-9b47-0d615ebf2b9d	872406cc0cf2ec86132af47cdc846b47cba4fc57e8aadb7e98342443a0d2a1c5	2025-02-10 23:04:09.07182+01	20240903104956_add_membership	\N	\N	2025-02-10 23:04:09.05941+01	1
3a8ee34b-5f74-4e43-b950-9b04e900dd23	2747e1d73c0d925c997b73d00091019f38b20ab82f0098ba3883df630f96b1db	2025-02-10 23:04:09.182176+01	20250210201434_add_reply_to_messages	\N	\N	2025-02-10 23:04:09.167733+01	1
c70efdb3-8b7d-46f4-8c80-565800edf199	e171a7afb6abeb36e75fffa91662fc6039e68b55a4dd2b02c7360c763a210c1b	2025-02-10 23:04:09.077147+01	20240905143902_add_refused_status_in_membership	\N	\N	2025-02-10 23:04:09.073214+01	1
768c848e-86fc-4492-997c-4fe3af433eaa	c7ad9c948ef367fd37511d80cf3d1a3408e6d049f99d13aeeb43aeca6fee5d8e	2025-02-10 23:04:09.084101+01	20240906195304_add_sport_in_product_and_delete_background_color	\N	\N	2025-02-10 23:04:09.078273+01	1
37ac06f8-a43d-41e5-a0ef-06ce75af5996	c0c9694132cc1a080c4fdc9acdba533fdce87b2caa39136969d76a5df38a3530	2025-02-10 23:04:09.09097+01	20240906201117_add_description_in_product	\N	\N	2025-02-10 23:04:09.085912+01	1
37eac14c-552a-4d14-9079-885943ba4b75	7d752f1497dff6aa9ef227b2f582bcf9a45674af9b4d496c7abfe66c2c9f493c	2025-02-10 23:04:09.848989+01	20250210220409_add_messagerie	\N	\N	2025-02-10 23:04:09.845162+01	1
34856da0-f3b4-41fa-b820-ad6a0c894991	7f55f88632718dc38313499485ab2efa09ddb6eb05ab04282d3a0ab1235f9cdd	2025-02-10 23:04:09.098487+01	20240906215014_add_level_in_product	\N	\N	2025-02-10 23:04:09.092834+01	1
ca02899a-13c3-4812-ace0-b856a8e146a2	e8d844ea822ef20a15eaa6c033f66a413777f867eeed4ed8f10eb51c12d6dc9d	2025-02-10 23:04:09.107102+01	20240907100505_test_without_slug	\N	\N	2025-02-10 23:04:09.100474+01	1
a47558d0-a2d9-4732-a34b-34493d58f119	60868371ea3cf7622fcf96a14f9e1f444c28627993a66ef307104fa036f5f434	2025-02-10 23:04:09.117427+01	20240907101207_add_slug_in_product	\N	\N	2025-02-10 23:04:09.108787+01	1
3cde8e90-1e73-42a0-b4a3-3a528ed15312	4fa54d51490b80fff85bb251bafcd24dc99f95eba410c117b4c956be008f32e9	2025-02-10 23:04:09.1358+01	20250112141300_update_user	\N	\N	2025-02-10 23:04:09.119249+01	1
ba5258c9-bfb9-4a50-b00a-2670dd0079de	027626bae984b094086b424a23c9f93585554f4e49767004fa7aa13f2a39aa95	2025-02-10 23:04:09.143252+01	20250113223443_update_product_with_location	\N	\N	2025-02-10 23:04:09.137651+01	1
577a55e0-10eb-4a50-b15d-db90e707a739	5da662cb287a335eff036bf74df81820d2079231e4f129077d11e740813cdf3d	2025-02-10 23:04:09.158011+01	20250210153818_add_messagerie	\N	\N	2025-02-10 23:04:09.145295+01	1
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: swan
--

COPY public.messages (id, text, "userId", "productId", "createdAt", reply_to_id) FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: StravaActivity StravaActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."StravaActivity"
    ADD CONSTRAINT "StravaActivity_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Membership_userId_productId_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "Membership_userId_productId_key" ON public."Membership" USING btree ("userId", "productId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: swan
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StravaActivity StravaActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public."StravaActivity"
    ADD CONSTRAINT "StravaActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: messages messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swan
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: swan
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

