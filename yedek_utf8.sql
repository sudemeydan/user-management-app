--
-- PostgreSQL database dump
--

\restrict sprhy3idK2VRk0ETq6hW299TFw6O7LihZCIraMdJLOVOO8kqfSIbSq3KpYMHVpk

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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
-- Name: EntryCategory; Type: TYPE; Schema: public; Owner: sude
--

CREATE TYPE public."EntryCategory" AS ENUM (
    'CONTACT_INFO',
    'EXPERIENCE',
    'EDUCATION',
    'SKILL',
    'PROJECT',
    'LANGUAGE',
    'CERTIFICATE',
    'OTHER'
);


ALTER TYPE public."EntryCategory" OWNER TO sude;

--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: sude
--

CREATE TYPE public."JobStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."JobStatus" OWNER TO sude;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AtsFormattedCV; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."AtsFormattedCV" (
    id integer NOT NULL,
    "cvId" integer NOT NULL,
    "fileId" text,
    content jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AtsFormattedCV" OWNER TO sude;

--
-- Name: AtsFormattedCV_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."AtsFormattedCV_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AtsFormattedCV_id_seq" OWNER TO sude;

--
-- Name: AtsFormattedCV_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."AtsFormattedCV_id_seq" OWNED BY public."AtsFormattedCV".id;


--
-- Name: Block; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."Block" (
    id integer NOT NULL,
    "blockerId" integer NOT NULL,
    "blockedId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Block" OWNER TO sude;

--
-- Name: Block_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."Block_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Block_id_seq" OWNER TO sude;

--
-- Name: Block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."Block_id_seq" OWNED BY public."Block".id;


--
-- Name: CV; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."CV" (
    id integer NOT NULL,
    "fileName" text NOT NULL,
    "fileId" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "rawText" text,
    status public."JobStatus" DEFAULT 'PENDING'::public."JobStatus" NOT NULL,
    summary text,
    "atsFormatFeedback" text,
    "atsFormatScore" integer
);


ALTER TABLE public."CV" OWNER TO sude;

--
-- Name: CVEntry; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."CVEntry" (
    id integer NOT NULL,
    "cvId" integer NOT NULL,
    category public."EntryCategory" NOT NULL,
    title text NOT NULL,
    subtitle text,
    "startDate" text,
    "endDate" text,
    description text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CVEntry" OWNER TO sude;

--
-- Name: CVEntry_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."CVEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CVEntry_id_seq" OWNER TO sude;

--
-- Name: CVEntry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."CVEntry_id_seq" OWNED BY public."CVEntry".id;


--
-- Name: CV_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."CV_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CV_id_seq" OWNER TO sude;

--
-- Name: CV_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."CV_id_seq" OWNED BY public."CV".id;


--
-- Name: Connection; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."Connection" (
    id integer NOT NULL,
    "senderId" integer NOT NULL,
    "receiverId" integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Connection" OWNER TO sude;

--
-- Name: Connection_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."Connection_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Connection_id_seq" OWNER TO sude;

--
-- Name: Connection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."Connection_id_seq" OWNED BY public."Connection".id;


--
-- Name: JobPosting; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."JobPosting" (
    id integer NOT NULL,
    title text NOT NULL,
    company text,
    description text NOT NULL,
    url text,
    "extractedSkills" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JobPosting" OWNER TO sude;

--
-- Name: JobPosting_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."JobPosting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JobPosting_id_seq" OWNER TO sude;

--
-- Name: JobPosting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."JobPosting_id_seq" OWNED BY public."JobPosting".id;


--
-- Name: Post; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."Post" (
    id integer NOT NULL,
    content text,
    "authorId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Post" OWNER TO sude;

--
-- Name: PostImage; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."PostImage" (
    id integer NOT NULL,
    url text NOT NULL,
    "fileId" text NOT NULL,
    "postId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostImage" OWNER TO sude;

--
-- Name: PostImage_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."PostImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PostImage_id_seq" OWNER TO sude;

--
-- Name: PostImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."PostImage_id_seq" OWNED BY public."PostImage".id;


--
-- Name: Post_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."Post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Post_id_seq" OWNER TO sude;

--
-- Name: Post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."Post_id_seq" OWNED BY public."Post".id;


--
-- Name: Profile; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."Profile" (
    id integer NOT NULL,
    bio text,
    phone text,
    "userId" integer NOT NULL
);


ALTER TABLE public."Profile" OWNER TO sude;

--
-- Name: ProfileImage; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."ProfileImage" (
    id integer NOT NULL,
    url text NOT NULL,
    "fileId" text NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfileImage" OWNER TO sude;

--
-- Name: ProfileImage_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."ProfileImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProfileImage_id_seq" OWNER TO sude;

--
-- Name: ProfileImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."ProfileImage_id_seq" OWNED BY public."ProfileImage".id;


--
-- Name: Profile_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."Profile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Profile_id_seq" OWNER TO sude;

--
-- Name: Profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."Profile_id_seq" OWNED BY public."Profile".id;


--
-- Name: TailoredCV; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."TailoredCV" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "jobPostingId" integer NOT NULL,
    "originalCvId" integer NOT NULL,
    "atsScore" integer,
    "improvedSummary" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "fileId" text
);


ALTER TABLE public."TailoredCV" OWNER TO sude;

--
-- Name: TailoredCVEntry; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."TailoredCVEntry" (
    id integer NOT NULL,
    "tailoredCvId" integer NOT NULL,
    category public."EntryCategory" NOT NULL,
    name text NOT NULL,
    description text,
    "isModified" boolean DEFAULT false NOT NULL,
    "aiComment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TailoredCVEntry" OWNER TO sude;

--
-- Name: TailoredCVEntry_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."TailoredCVEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TailoredCVEntry_id_seq" OWNER TO sude;

--
-- Name: TailoredCVEntry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."TailoredCVEntry_id_seq" OWNED BY public."TailoredCVEntry".id;


--
-- Name: TailoredCV_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."TailoredCV_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TailoredCV_id_seq" OWNER TO sude;

--
-- Name: TailoredCV_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."TailoredCV_id_seq" OWNED BY public."TailoredCV".id;


--
-- Name: Task; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."Task" (
    id integer NOT NULL,
    title text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Task" OWNER TO sude;

--
-- Name: Task_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."Task_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Task_id_seq" OWNER TO sude;

--
-- Name: Task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."Task_id_seq" OWNED BY public."Task".id;


--
-- Name: UpgradeRequest; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."UpgradeRequest" (
    id integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."UpgradeRequest" OWNER TO sude;

--
-- Name: UpgradeRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."UpgradeRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UpgradeRequest_id_seq" OWNER TO sude;

--
-- Name: UpgradeRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."UpgradeRequest_id_seq" OWNED BY public."UpgradeRequest".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: sude
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    username text NOT NULL,
    age integer,
    address text,
    role text DEFAULT 'FREE_USER'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "resetPasswordToken" text,
    "resetPasswordExpires" timestamp(3) without time zone,
    "isPrivate" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO sude;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: sude
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO sude;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sude
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: AtsFormattedCV id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."AtsFormattedCV" ALTER COLUMN id SET DEFAULT nextval('public."AtsFormattedCV_id_seq"'::regclass);


--
-- Name: Block id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Block" ALTER COLUMN id SET DEFAULT nextval('public."Block_id_seq"'::regclass);


--
-- Name: CV id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CV" ALTER COLUMN id SET DEFAULT nextval('public."CV_id_seq"'::regclass);


--
-- Name: CVEntry id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CVEntry" ALTER COLUMN id SET DEFAULT nextval('public."CVEntry_id_seq"'::regclass);


--
-- Name: Connection id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Connection" ALTER COLUMN id SET DEFAULT nextval('public."Connection_id_seq"'::regclass);


--
-- Name: JobPosting id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."JobPosting" ALTER COLUMN id SET DEFAULT nextval('public."JobPosting_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: PostImage id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."PostImage" ALTER COLUMN id SET DEFAULT nextval('public."PostImage_id_seq"'::regclass);


--
-- Name: Profile id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Profile" ALTER COLUMN id SET DEFAULT nextval('public."Profile_id_seq"'::regclass);


--
-- Name: ProfileImage id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."ProfileImage" ALTER COLUMN id SET DEFAULT nextval('public."ProfileImage_id_seq"'::regclass);


--
-- Name: TailoredCV id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCV" ALTER COLUMN id SET DEFAULT nextval('public."TailoredCV_id_seq"'::regclass);


--
-- Name: TailoredCVEntry id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCVEntry" ALTER COLUMN id SET DEFAULT nextval('public."TailoredCVEntry_id_seq"'::regclass);


--
-- Name: Task id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Task" ALTER COLUMN id SET DEFAULT nextval('public."Task_id_seq"'::regclass);


--
-- Name: UpgradeRequest id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."UpgradeRequest" ALTER COLUMN id SET DEFAULT nextval('public."UpgradeRequest_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: AtsFormattedCV; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."AtsFormattedCV" (id, "cvId", "fileId", content, "createdAt", "updatedAt") FROM stdin;
1	21	1NZViqKvBE_88w8J99wvS4_YCgtcf17e4	\N	2026-03-18 10:43:30.774	2026-03-18 10:43:30.774
\.


--
-- Data for Name: Block; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."Block" (id, "blockerId", "blockedId", "createdAt") FROM stdin;
\.


--
-- Data for Name: CV; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."CV" (id, "fileName", "fileId", "fileSize", "mimeType", "isActive", "userId", "createdAt", "updatedAt", "rawText", status, summary, "atsFormatFeedback", "atsFormatScore") FROM stdin;
18	Sude-Meydan-CV (1).pdf	1-8lmB7hRQELpMV_acHXN6TvO-d856FKi	91814	application/pdf	t	3	2026-03-09 13:47:19.704	2026-03-18 10:03:17.963	Sude Meydan\nComputer Engineering Student\nsude.meydan35@gmail.com\n \n05061202652\n \nIzmir, Turkey\n \n2003-07-10\n \ngithub.com/sudemeydan\n \nlinkedin.com/in/sudemeydan/\n \nProfile\nAs a final-year Computer Engineering student, I am eager to lay the foundations for my career in technology. I \nhave acquired the fundamental knowledge and am ready to apply my skills to real-world projects. My goal is to \nmake meaningful contributions and keep up with the latest innovations in this field.\nEducation\nBachelor's Degree, Afyon Kocatepe University\n09/2022 ÔÇô Present\nSkills\nProgramming Languages\nPython, C#, JavaScript, SQL\nLibraries & Frameworks\nPandas, NumPy, Scikit-learn, Sequelize ORM\nData Science & AI\nMachine Learning, Deep Learning, Data Mining, \nNatural Language Processing, Time Series Analysis, \nPredictive Modeling\nBackend Development\nNode.js, Express.js\nFrontend Development\nHTML5, CSS3, JavaScript , EJS , Bootstrap 5, \nResponsive Design\nDatabase Management\nMySQL, Relational Database Design, Sequelize ORM.\nLanguages\nEnglish\nB1\nCertificates\n11th Azerbaijan Certificate for \nLife Engineering and Applied \nSciences\nISMSIT 2025 ÔÇô IEEE Supported \nConference Certificate of \nParticipation Ankara, T├╝rkiye ÔÇô \n14ÔÇô16 November 2025\nPresented a project on flight \ndelay forecasting\nProjects\nFlight Delay Prediction: Ensemble ML & Time Series Forecasting, \nPython, Scikit-Learn, PyTorch, XGBoost, TimesFM, Flask\nÔÇóLarge-Scale Data Pipeline: Integrated 454,000+ flight records with real-time meteorological data using\nMeteostat API to analyze the impact of weather on aviation operations.\nÔÇóHigh-Accuracy Regression Models: Developed and benchmarked ensemble models (XGBoost, Random \nForest,\nLightGBM). Achieved a 91.9% R┬▓ score with XGBoost, optimizing for RMSE and MAE via\nRandomizedSearchCV.ÔÇó\nÔÇóState-of-the-Art Time Series Modeling: Implemented advanced Deep Learning architectures including\nÔÇóTimesFM, TimeLLM (GPT-2 based), and Temporal Fusion Transformers (TFT) to capture complex temporal\ndependencies and seasonality.\nÔÇóFeature Engineering: Applied advanced preprocessing techniques such as IQR outlier detection, lag \nfeatures,\nrolling averages, and cyclical date encoding to improve model robustness.\nÔÇóWeb Deployment: Deployed the prediction engine as a user-friendly web application using Flask, enabling\ndynamic, minute-based delay forecasts.\nNoteHub ÔÇô Educational Management Platform (LMS), \nNode.js, Express, MySQL, Sequelize ORM, EJS (MVC Architecture)\nÔÇóFull-Stack Architecture: Developed a comprehensive Learning Management System (LMS) using Node.js \nand\nExpress, implementing a clean MVC structure for scalability.\nÔÇóSecurity & Logic: Engineered robust security features including RBAC (Role-Based Access Control) and\ndesigned a conflict-free appointment scheduling algorithm.\nÔÇóDatabase Management: Constructed complex relational schemas using MySQL and Sequelize ORM to\nefficiently handle resource sharing, assignment submissions, and user data.\nTurkish Lyrical Sentiment Analysis via Fine-Tuned BERT Architecture, \nNLP, BERT, Transfer Learning, Flask, Web Scraping\nÔÇóEnd-to-End NLP Pipeline: Built a multi-class sentiment classification system specifically for Turkish song\nlyrics using Transfer Learning techniques.\nÔÇóAutomated Data Engineering: Applied Zero-Shot Learning (Pseudo-Labeling) to automatically label raw\nweb-scraped data, creating a high-quality training dataset without manual annotation.\nÔÇóModel Deployment: Fine-tuned a pre-trained BERT architecture to capture semantic nuances in Turkish\nlanguage and deployed the model as a real-time RESTful API using Flask.\nAI-Driven Phishing Detection & Categorization System, \nDeep Learning (XLM-RoBERTa), LLM (Mistral), Cybersecurity\nÔÇóHybrid Detection Engine: Developed a phishing detection system combining Deep Learning (XLM-RoBERTa)\nwith rule-based feature extraction (URL analysis, IP usage, and suspicious patterns).\nÔÇóAdvanced Classification: Designed the model to perform both binary classification (Safe vs. Phishing) and\nfine-grained category prediction for malicious content.\nÔÇóInteractive Interface: Implemented an interactive web interface integrated with an optional Mistral LLM \ntoprovide users with human-readable explanations for detected security threats.\nProfessional Experience\nData Science Intern\n2024/05 ÔÇô 2024/07\nUnited States (Remote)\nPracticus AI\nEnd-to-End ML Development: Executed the full data science lifecycle using the\nPracticus AI platform, ranging from raw data ingestion to model training.\nData Preprocessing: Performed rigorous data cleaning, missing value analysis, and\noutlier detection to prepare high-quality datasets for machine learning tasks.\nModel Training & Evaluation: Trained supervised learning models on processed\ndatasets and analyzed performance metrics to optimize prediction accuracy.\nTechnical Stack: Utilized Python (Pandas, Scikit-learn) and SQL for data\nmanipulation, statistical analysis, and feature engineering\n	COMPLETED	Son s─▒n─▒f Bilgisayar M├╝hendisli─şi ├Â─şrencisi olarak teknoloji kariyerimin temellerini atmaya hevesliyim. Temel bilgileri edindim ve yeteneklerimi ger├ğek d├╝nya projelerine uygulamaya haz─▒r─▒m. Amac─▒m anlaml─▒ katk─▒lar sa─şlamak ve bu alandaki en son yenilikleri takip etmektir.	\N	\N
3	MindFlow_MVP_Plan.docx	1P2DHCD81YXdDuJEUb_xYEjs6PkFKFoEN	19539	application/vnd.openxmlformats-officedocument.wordprocessingml.document	f	4	2026-03-05 07:45:06.308	2026-03-05 07:48:50.657	\N	PENDING	\N	\N	\N
2	Sude-Meydan-CV (1).pdf	1CuoqkjIAfLQ1bkBR_QTWX1IrF-aV2wmL	91814	application/pdf	t	4	2026-03-05 07:44:59.901	2026-03-05 07:48:50.657	\N	PENDING	\N	\N	\N
21	makine-muhendisi-cv-ornegi.pdf	1ZDEUqX5-_Wd_O0rhxu0X1SIZPGrwClIq	388402	application/pdf	f	3	2026-03-18 10:41:59.069	2026-03-18 10:42:35.51	├ûzge├ğmi┼ş ├ûzeti \n                                                                                                                                                                                                            \n                                                   \n \nMakine m├╝hendisli─şi alan─▒nda 12 y─▒ll─▒k deneyime sahip bir m├╝hendis olarak, \ntasar─▒m, ├╝retim s├╝re├ğleri ve proje y├Ânetimi konular─▒nda geni┼ş bir bilgi \nbirikimine sahibim. Analitik d├╝┼ş├╝nme becerim ve problem ├ğ├Âzme \nyetene─şimle, s├╝re├ğleri optimize etmeye y├Ânelik projelerde aktif rol ald─▒m. \nTak─▒m ├ğal─▒┼şmas─▒na yatk─▒n ve ileti┼şim becerileri g├╝├ğl├╝ bir m├╝hendis olarak, \nkariyerimi daha ileri ta┼ş─▒mak i├ğin yeni f─▒rsatlar ar─▒yorum. \n \n \n \n \n─░┼ş Deneyimleri \nSena Kara \n \nK─▒demli Proje M├╝hendisi \nK─▒demli Proje M├╝hendisi \n \nXYZ M├╝hendislik ┬À (Ocak 2018 - Devam ediyor) \n+90 (532) 123 45 67 \n \nisimsoysim@gmail.com \n´éÀ \nMekanik tasar─▒m projelerinde liderlik yaparak projelerin zaman─▒nda \ntamamlanmas─▒n─▒ sa─şlama. \n \n´éÀ \n├£retim s├╝re├ğlerini optimize etmek i├ğin verimlilik analizleri yapma. \nDo─şum Tarihi: 1989 (35 \nYa┼ş) \n \n´éÀ \nM├╝┼şteri taleplerine uygun ├╝r├╝n geli┼ştirme s├╝re├ğlerinde aktif rol alma. \nBursa, Osmangazi \n \nProje M├╝hendisi \n \n \nABC Sanayi ┬À (Eyl├╝l 2011 - Aral─▒k 2017) \n \n \n´éÀ \nProje y├Ânetimi s├╝re├ğlerini y├╝r├╝tme ve proje planlamas─▒ yapma. \n´éÀ \n├£retim hatt─▒nda sorun giderme ve teknik destek sa─şlama. \n \n \n \n´éÀ \n├£r├╝n tasar─▒m─▒ ve geli┼ştirilmesi a┼şamalar─▒nda m├╝hendislik ├ğ├Âz├╝mleri \nsunma. \n \nMakine M├╝hendisi \n \nPRS Teknoloji ┬À (Ocak 2010 - A─şustos 2011) \n \n´éÀ \nPrototip tasar─▒m s├╝re├ğlerinde yer alma ve ├╝r├╝n geli┼ştirme ├ğal─▒┼şmalar─▒ \nyapma. \n \n \n´éÀ \n├£retim ekipmanlar─▒n─▒n bak─▒m─▒ ve onar─▒m─▒ ile ilgili s├╝re├ğlerde g├Ârev \nalma. \n \nStajyer Makine M├╝hendisi \n \nGHI M├╝hendislik ┬À (Haziran 2008 - Eyl├╝l 2008) \n \n´éÀ \nTasar─▒m departman─▒nda teknik ├ğizim ve modelleme konular─▒nda \n├ğal─▒┼şamalar \n \n \n´éÀ \nProje s├╝re├ğlerine destek olmak i├ğin veri toplama ve analiz yapma. \n \n \nE─şitim Bilgileri \n \n \nUluda─ş ├£niversitesi ┬À Makine M├╝hendisli─şi (Eyl├╝l 2006 - Haziran 2011) \nLisans Derecesi \n \n´éÀ \nTermodinamik, ak─▒┼şkanlar mekani─şi, malzeme bilimi ve makine \ntasar─▒m─▒ dersleri. \n \n´éÀ \nProje bazl─▒ uygulamalar ve laboratuvar ├ğal─▒┼şmalar─▒. \n \n \n\n\nTeknik Beceriler \n´éÀ \nS├Âzle┼şm CAD Yaz─▒l─▒mlar─▒: SolidWorks (─░leri), AutoCAD (Orta) \n \n´éÀ \nAnalitik Ara├ğlar: MATLAB (─░leri), ANSYS (Orta) \n´éÀ \nProje Y├Ânetimi: Proje planlamas─▒ ve y├Ânetimi (─░leri) \n´éÀ \n├£retim Teknolojileri: CNC makineleri (─░leri), ├╝retim s├╝re├ğleri (Orta) \n´éÀ \nVeri Analizi: Excel (─░leri), di─şer yaz─▒l─▒mlar (Orta) \nDiller \n´éÀ \nT├╝rk├ğe (Ana dil) \n´éÀ \n─░ngilizce (─░leri) \n´éÀ \nFrans─▒zca (Ba┼şlang─▒├ğ) \n\n\n	COMPLETED	Makine m├╝hendisli─şi alan─▒nda 12 y─▒ll─▒k deneyime sahip bir m├╝hendis olarak, tasar─▒m, ├╝retim s├╝re├ğleri ve proje y├Ânetimi konular─▒nda geni┼ş bir bilgi birikimine sahibim. Analitik d├╝┼ş├╝nme becerim ve problem ├ğ├Âzme yetene─şimle, s├╝re├ğleri optimize etmeye y├Ânelik projelerde aktif rol ald─▒m. Tak─▒m ├ğal─▒┼şmas─▒na yatk─▒n ve ileti┼şim becerileri g├╝├ğl├╝ bir m├╝hendis olarak, kariyerimi daha ileri ta┼ş─▒mak i├ğin yeni f─▒rsatlar ar─▒yorum.	CV'nizdeki temel bilgiler ATS uyumlulu─şu a├ğ─▒s─▒ndan baz─▒ ciddi sorunlar bar─▒nd─▒r─▒yor. En b├╝y├╝k sorun, ad─▒n─▒z, ileti┼şim bilgileriniz (telefon, e-posta) ve ki┼şisel detaylar─▒n─▒z─▒n (do─şum tarihi, adres) '─░┼ş Deneyimleri' b├Âl├╝m├╝n├╝n i├ğine kar─▒┼şm─▒┼ş olmas─▒d─▒r. Bir ATS, aday─▒ tan─▒mak i├ğin bu bilgilere en ├╝stte, kolayca eri┼şilebilir bir b├Âl├╝mde ihtiya├ğ duyar. Bu durum, ├Âzge├ğmi┼şinizin otomatik sistemler taraf─▒ndan do─şru bir ┼şekilde i┼şlenmesini engelleyecektir. Di─şer b├Âl├╝mleriniz (├ûzge├ğmi┼ş ├ûzeti, ─░┼ş Deneyimleri, E─şitim Bilgileri, Teknik Beceriler, Diller) genel olarak iyi yap─▒land─▒r─▒lm─▒┼ş ve i├ğerik olarak zengin. Ancak, ileti┼şim bilgilerinizin yanl─▒┼ş yerle┼şimi, genel puan─▒n─▒z─▒ d├╝┼ş├╝r├╝yor. ├ûzge├ğmi┼şinizi, ileti┼şim bilgilerinizi en ├╝ste net ve ayr─▒ bir b├Âl├╝m olarak ekleyerek g├╝ncelleyin ve metin i├ğindeki fazla bo┼şluklar─▒ azalt─▒n. Bu d├╝zeltmeler ATS uyumlulu─şunu ├Ânemli ├Âl├ğ├╝de art─▒racakt─▒r.	45
\.


--
-- Data for Name: CVEntry; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."CVEntry" (id, "cvId", category, title, subtitle, "startDate", "endDate", description, metadata, "createdAt") FROM stdin;
1	18	CONTACT_INFO	Sude Meydan	Computer Engineering Student	\N	\N	\N	{"email": "sude.meydan35@gmail.com", "phone": "05061202652", "github": "github.com/sudemeydan", "linkedin": "linkedin.com/in/sudemeydan/", "location": "Izmir, Turkey"}	2026-03-09 13:47:44.124
2	18	EDUCATION	Afyon Kocatepe University	Bachelor's Degree	2022-09	Present	\N	{}	2026-03-09 13:47:44.124
3	18	EXPERIENCE	Practicus AI	Data Science Intern	2024-05	2024-07	End-to-End ML Development: Executed the full data science lifecycle using the Practicus AI platform, ranging from raw data ingestion to model training.\nData Preprocessing: Performed rigorous data cleaning, missing value analysis, and outlier detection to prepare high-quality datasets for machine learning tasks.\nModel Training & Evaluation: Trained supervised learning models on processed datasets and analyzed performance metrics to optimize prediction accuracy.\nTechnical Stack: Utilized Python (Pandas, Scikit-learn) and SQL for data manipulation, statistical analysis, and feature engineering	{"location": "United States (Remote)"}	2026-03-09 13:47:44.124
4	18	SKILL	Programming Languages	\N	\N	\N	Python, C#, JavaScript, SQL	{}	2026-03-09 13:47:44.124
5	18	SKILL	Libraries & Frameworks	\N	\N	\N	Pandas, NumPy, Scikit-learn, Sequelize ORM	{}	2026-03-09 13:47:44.124
6	18	SKILL	Data Science & AI	\N	\N	\N	Machine Learning, Deep Learning, Data Mining, Natural Language Processing, Time Series Analysis, Predictive Modeling	{}	2026-03-09 13:47:44.124
7	18	SKILL	Backend Development	\N	\N	\N	Node.js, Express.js	{}	2026-03-09 13:47:44.124
8	18	SKILL	Frontend Development	\N	\N	\N	HTML5, CSS3, JavaScript, EJS, Bootstrap 5, Responsive Design	{}	2026-03-09 13:47:44.124
9	18	SKILL	Database Management	\N	\N	\N	MySQL, Relational Database Design, Sequelize ORM	{}	2026-03-09 13:47:44.124
10	18	LANGUAGE	English	B1	\N	\N	\N	{}	2026-03-09 13:47:44.124
11	18	CERTIFICATE	11th Azerbaijan Certificate for Life Engineering and Applied Sciences	\N	\N	\N	\N	{}	2026-03-09 13:47:44.124
12	18	CERTIFICATE	ISMSIT 2025 ÔÇô IEEE Supported Conference Certificate of Participation	Presented a project on flight delay forecasting	2025-11	2025-11	\N	{"location": "Ankara, T├╝rkiye"}	2026-03-09 13:47:44.124
13	18	PROJECT	Flight Delay Prediction	Ensemble ML & Time Series Forecasting	\N	\N	Large-Scale Data Pipeline: Integrated 454,000+ flight records with real-time meteorological data using Meteostat API to analyze the impact of weather on aviation operations.\nHigh-Accuracy Regression Models: Developed and benchmarked ensemble models (XGBoost, Random Forest, LightGBM). Achieved a 91.9% R┬▓ score with XGBoost, optimizing for RMSE and MAE via RandomizedSearchCV.\nState-of-the-Art Time Series Modeling: Implemented advanced Deep Learning architectures including TimesFM, TimeLLM (GPT-2 based), and Temporal Fusion Transformers (TFT) to capture complex temporal dependencies and seasonality.\nFeature Engineering: Applied advanced preprocessing techniques such as IQR outlier detection, lag features, rolling averages, and cyclical date encoding to improve model robustness.\nWeb Deployment: Deployed the prediction engine as a user-friendly web application using Flask, enabling dynamic, minute-based delay forecasts.	{"technologies": "Python, Scikit-Learn, PyTorch, XGBoost, TimesFM, Flask"}	2026-03-09 13:47:44.124
14	18	PROJECT	NoteHub ÔÇô Educational Management Platform (LMS)	MVC Architecture	\N	\N	Full-Stack Architecture: Developed a comprehensive Learning Management System (LMS) using Node.js and Express, implementing a clean MVC structure for scalability.\nSecurity & Logic: Engineered robust security features including RBAC (Role-Based Access Control) and designed a conflict-free appointment scheduling algorithm.\nDatabase Management: Constructed complex relational schemas using MySQL and Sequelize ORM to efficiently handle resource sharing, assignment submissions, and user data.	{"technologies": "Node.js, Express, MySQL, Sequelize ORM, EJS"}	2026-03-09 13:47:44.124
15	18	PROJECT	Turkish Lyrical Sentiment Analysis via Fine-Tuned BERT Architecture	NLP, BERT, Transfer Learning, Flask, Web Scraping	\N	\N	End-to-End NLP Pipeline: Built a multi-class sentiment classification system specifically for Turkish song lyrics using Transfer Learning techniques.\nAutomated Data Engineering: Applied Zero-Shot Learning (Pseudo-Labeling) to automatically label raw web-scraped data, creating a high-quality training dataset without manual annotation.\nModel Deployment: Fine-tuned a pre-trained BERT architecture to capture semantic nuances in Turkish language and deployed the model as a real-time RESTful API using Flask.	{"technologies": "NLP, BERT, Transfer Learning, Flask, Web Scraping"}	2026-03-09 13:47:44.124
16	18	PROJECT	AI-Driven Phishing Detection & Categorization System	Deep Learning (XLM-RoBERTa), LLM (Mistral), Cybersecurity	\N	\N	Hybrid Detection Engine: Developed a phishing detection system combining Deep Learning (XLM-RoBERTa) with rule-based feature extraction (URL analysis, IP usage, and suspicious patterns).\nAdvanced Classification: Designed the model to perform both binary classification (Safe vs. Phishing) and fine-grained category prediction for malicious content.\nInteractive Interface: Implemented an interactive web interface integrated with an optional Mistral LLM to provide users with human-readable explanations for detected security threats.	{"technologies": "Deep Learning (XLM-RoBERTa), LLM (Mistral), Cybersecurity"}	2026-03-09 13:47:44.124
38	21	CONTACT_INFO	Belirtilmemi┼ş	\N	\N	\N	\N	{"email": "isimsoysim@gmail.com", "phone": "+90 (532) 123 45 67", "fullName": "Sena Kara"}	2026-03-18 10:42:35.523
39	21	EXPERIENCE	XYZ M├╝hendislik	K─▒demli Proje M├╝hendisi	2018-01	Present	´éÀ Mekanik tasar─▒m projelerinde liderlik yaparak projelerin zaman─▒nda tamamlanmas─▒n─▒ sa─şlama.\n´éÀ ├£retim s├╝re├ğlerini optimize etmek i├ğin verimlilik analizleri yapma.\n´éÀ M├╝┼şteri taleplerine uygun ├╝r├╝n geli┼ştirme s├╝re├ğlerinde aktif rol alma.	null	2026-03-18 10:42:35.523
40	21	EXPERIENCE	ABC Sanayi	Proje M├╝hendisi	2011-09	2017-12	´éÀ Proje y├Ânetimi s├╝re├ğlerini y├╝r├╝tme ve proje planlamas─▒ yapma.\n´éÀ ├£retim hatt─▒nda sorun giderme ve teknik destek sa─şlama.\n´éÀ ├£r├╝n tasar─▒m─▒ ve geli┼ştirilmesi a┼şamalar─▒nda m├╝hendislik ├ğ├Âz├╝mleri sunma.	null	2026-03-18 10:42:35.523
41	21	EXPERIENCE	PRS Teknoloji	Makine M├╝hendisi	2010-01	2011-08	´éÀ Prototip tasar─▒m s├╝re├ğlerinde yer alma ve ├╝r├╝n geli┼ştirme ├ğal─▒┼şmalar─▒ yapma.\n´éÀ ├£retim ekipmanlar─▒n─▒n bak─▒m─▒ ve onar─▒m─▒ ile ilgili s├╝re├ğlerde g├Ârev alma.	null	2026-03-18 10:42:35.523
42	21	EXPERIENCE	GHI M├╝hendislik	Stajyer Makine M├╝hendisi	2008-06	2008-09	´éÀ Tasar─▒m departman─▒nda teknik ├ğizim ve modelleme konular─▒nda ├ğal─▒┼şmalar yapma.\n´éÀ Proje s├╝re├ğlerine destek olmak i├ğin veri toplama ve analiz yapma.	null	2026-03-18 10:42:35.523
43	21	EDUCATION	Uluda─ş ├£niversitesi	Makine M├╝hendisli─şi (Lisans Derecesi)	2006-09	2011-06	´éÀ Termodinamik, ak─▒┼şkanlar mekani─şi, malzeme bilimi ve makine tasar─▒m─▒ dersleri.\n´éÀ Proje bazl─▒ uygulamalar ve laboratuvar ├ğal─▒┼şmalar─▒.	null	2026-03-18 10:42:35.523
44	21	SKILL	SolidWorks	─░leri	\N	\N	CAD Yaz─▒l─▒mlar─▒	{}	2026-03-18 10:42:35.523
45	21	SKILL	AutoCAD	Orta	\N	\N	CAD Yaz─▒l─▒mlar─▒	{}	2026-03-18 10:42:35.523
46	21	SKILL	MATLAB	─░leri	\N	\N	Analitik Ara├ğlar	{}	2026-03-18 10:42:35.523
47	21	SKILL	ANSYS	Orta	\N	\N	Analitik Ara├ğlar	{}	2026-03-18 10:42:35.523
48	21	SKILL	Proje Y├Ânetimi	─░leri	\N	\N	Proje planlamas─▒ ve y├Ânetimi	{}	2026-03-18 10:42:35.523
49	21	SKILL	CNC makineleri	─░leri	\N	\N	├£retim Teknolojileri	{}	2026-03-18 10:42:35.523
50	21	SKILL	├£retim s├╝re├ğleri	Orta	\N	\N	├£retim Teknolojileri	{}	2026-03-18 10:42:35.523
51	21	SKILL	Excel	─░leri	\N	\N	Veri Analizi	{}	2026-03-18 10:42:35.523
52	21	SKILL	Di─şer veri analizi yaz─▒l─▒mlar─▒	Orta	\N	\N	Veri Analizi	{}	2026-03-18 10:42:35.523
53	21	LANGUAGE	T├╝rk├ğe	Ana dil	\N	\N	\N	{}	2026-03-18 10:42:35.523
54	21	LANGUAGE	─░ngilizce	─░leri	\N	\N	\N	{}	2026-03-18 10:42:35.523
55	21	LANGUAGE	Frans─▒zca	Ba┼şlang─▒├ğ	\N	\N	\N	{}	2026-03-18 10:42:35.523
\.


--
-- Data for Name: Connection; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."Connection" (id, "senderId", "receiverId", status, "createdAt") FROM stdin;
1	4	3	ACCEPTED	2026-03-05 07:49:12.431
\.


--
-- Data for Name: JobPosting; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."JobPosting" (id, title, company, description, url, "extractedSkills", "createdAt", "updatedAt") FROM stdin;
1	Full Stack Developer	Nodelabs Software	─░┼ş ilan─▒ hakk─▒nda\nNodelabs Software, 2024 Mart ay─▒nda kurulan ve mobil uygulama geli┼ştirme ile bu uygulamalar─▒n pazarlama ve b├╝y├╝me s├╝re├ğlerini y├Âneten dinamik bir teknoloji ┼şirketidir. Mevcut ve yeni projelerimizin altyap─▒s─▒n─▒ geli┼ştirecek, ├Âl├ğeklenebilir ve performansl─▒ sistemler kurabilecek bir Full Stack Developer ar─▒yoruz.\n\n\nG├Ârev ve Sorumluluklar\n\nNode.js ile backend servislerin geli┼ştirilmesi\nMongoDB veritaban─▒ yap─▒s─▒n─▒n tasar─▒m─▒ ve y├Ânetimi\nRabbitMQ ile mesaj kuyruk sistemlerinin entegrasyonu\nRedis ile cache sistemlerinin kurulumu ve kullan─▒m─▒\nElasticsearch kullanarak arama altyap─▒lar─▒n─▒n yap─▒land─▒r─▒lmas─▒\nPlugin mimarisine uygun mod├╝ler kod yaz─▒m─▒\nServer konfig├╝rasyonu, deployment s├╝re├ğleri, log ve memory y├Ânetimi\nMemory leakÔÇÖlere kar┼ş─▒ optimize ve s├╝rd├╝r├╝lebilir kod geli┼ştirme\nTemel d├╝zeyde admin panel entegrasyonu (ReactJS)\nHaz─▒r templateÔÇÖler (Shadcn vb.) kullanarak dashboard ve grafik i├ğeren y├Ânetim panelleri olu┼şturabilme\n\nMevcut frontend mimarisine uygun API entegrasyonlar─▒ yapabilme\n\n\nArad─▒─ş─▒m─▒z ├ûzellikler\n\nNode.js + Express.js konusunda tecr├╝beli\nMongoDB, Redis, RabbitMQ, Elasticsearch teknolojilerine h├ókim\nMemory optimizasyonu ve performans konular─▒nda bilgili\nTemiz, okunabilir ve s├╝rd├╝r├╝lebilir kod yazma al─▒┼şkanl─▒─ş─▒\nVersiyon kontrol sistemlerine (Git) h├ókim\nDocker ortamlar─▒nda ├ğal─▒┼şm─▒┼ş olmak avantajd─▒r\nFrontend taraf─▒nda temel d├╝zey\nHaz─▒r admin panel ┼şablonlar─▒n─▒ kullanarak fonksiyonel y├Ânetim panelleri geli┼ştirmi┼ş olmak\n\nOlmas─▒ Avantajd─▒r\n\nPlugin tabanl─▒ mimari deneyimi\nCI/CD s├╝re├ğlerinde deneyim\nKendi ba┼ş─▒na sunucu aya─şa kald─▒rm─▒┼ş, production ortam y├Ânetmi┼ş olmas─▒\nProje sorumlulu─şu alabilecek disipline sahip olmas─▒\n\n\nBa┼şvuru\n\nE─şer yukar─▒daki teknolojilere h├ókimsen, startup ruhunu seviyorsan ve g├╝├ğl├╝ bir ├╝r├╝n ekibinde yer almak istiyorsan ba┼şvurunu bekliyoruz.	\N	["Node.js", "Express.js", "MongoDB", "RabbitMQ", "Redis", "Elasticsearch", "ReactJS (Temel D├╝zey)", "Git", "Docker", "CI/CD", "Mod├╝ler Kod Yaz─▒m─▒", "Server Konfig├╝rasyonu"]	2026-03-16 08:19:16.8	2026-03-16 08:19:16.8
2	Full Stack Developer	Nodelabs Software	─░┼ş ilan─▒ hakk─▒nda\nNodelabs Software, 2024 Mart ay─▒nda kurulan ve mobil uygulama geli┼ştirme ile bu uygulamalar─▒n pazarlama ve b├╝y├╝me s├╝re├ğlerini y├Âneten dinamik bir teknoloji ┼şirketidir. Mevcut ve yeni projelerimizin altyap─▒s─▒n─▒ geli┼ştirecek, ├Âl├ğeklenebilir ve performansl─▒ sistemler kurabilecek bir Full Stack Developer ar─▒yoruz.\n\n\nG├Ârev ve Sorumluluklar\n\nNode.js ile backend servislerin geli┼ştirilmesi\nMongoDB veritaban─▒ yap─▒s─▒n─▒n tasar─▒m─▒ ve y├Ânetimi\nRabbitMQ ile mesaj kuyruk sistemlerinin entegrasyonu\nRedis ile cache sistemlerinin kurulumu ve kullan─▒m─▒\nElasticsearch kullanarak arama altyap─▒lar─▒n─▒n yap─▒land─▒r─▒lmas─▒\nPlugin mimarisine uygun mod├╝ler kod yaz─▒m─▒\nServer konfig├╝rasyonu, deployment s├╝re├ğleri, log ve memory y├Ânetimi\nMemory leakÔÇÖlere kar┼ş─▒ optimize ve s├╝rd├╝r├╝lebilir kod geli┼ştirme\nTemel d├╝zeyde admin panel entegrasyonu (ReactJS)\nHaz─▒r templateÔÇÖler (Shadcn vb.) kullanarak dashboard ve grafik i├ğeren y├Ânetim panelleri olu┼şturabilme\n\nMevcut frontend mimarisine uygun API entegrasyonlar─▒ yapabilme\n\n\nArad─▒─ş─▒m─▒z ├ûzellikler\n\nNode.js + Express.js konusunda tecr├╝beli\nMongoDB, Redis, RabbitMQ, Elasticsearch teknolojilerine h├ókim\nMemory optimizasyonu ve performans konular─▒nda bilgili\nTemiz, okunabilir ve s├╝rd├╝r├╝lebilir kod yazma al─▒┼şkanl─▒─ş─▒\nVersiyon kontrol sistemlerine (Git) h├ókim\nDocker ortamlar─▒nda ├ğal─▒┼şm─▒┼ş olmak avantajd─▒r\nFrontend taraf─▒nda temel d├╝zey\nHaz─▒r admin panel ┼şablonlar─▒n─▒ kullanarak fonksiyonel y├Ânetim panelleri geli┼ştirmi┼ş olmak\n\nOlmas─▒ Avantajd─▒r\n\nPlugin tabanl─▒ mimari deneyimi\nCI/CD s├╝re├ğlerinde deneyim\nKendi ba┼ş─▒na sunucu aya─şa kald─▒rm─▒┼ş, production ortam y├Ânetmi┼ş olmas─▒\nProje sorumlulu─şu alabilecek disipline sahip olmas─▒\n\n\nBa┼şvuru\n\nE─şer yukar─▒daki teknolojilere h├ókimsen, startup ruhunu seviyorsan ve g├╝├ğl├╝ bir ├╝r├╝n ekibinde yer almak istiyorsan ba┼şvurunu bekliyoruz.	\N	["Node.js", "Express.js", "MongoDB", "RabbitMQ", "Redis", "Elasticsearch", "ReactJS (temel d├╝zey)", "Shadcn (veya benzeri template kullan─▒m─▒)", "Plugin mimarisi", "Server konfig├╝rasyonu", "Deployment s├╝re├ğleri", "Log y├Ânetimi", "Memory y├Ânetimi", "Memory leak optimizasyonu", "API entegrasyonu", "Git", "Docker", "CI/CD", "Production ortam y├Ânetimi"]	2026-03-16 08:38:39.673	2026-03-16 08:38:39.673
3	Applied AI Engineer	\N	─░┼ş ilan─▒ hakk─▒nda\nPosition: Applied AI Engineer\n\nType: Hourly contract\n\nCompensation: $30-$80/hr\n\nLocation: Remote\n\nCommitment: 10ÔÇô40 hours/week\n\nRole Responsibilities\n\nDesign, develop, and deploy machine learning models to address real-world business problems.\nCollaborate with cross-functional teams to identify opportunities for AI integration and innovation.\nPreprocess, analyze, and interpret complex datasets using Python and related data tools.\nDevelop APIs and data pipelines to integrate machine learning models into production systems.\nOptimize models for scalability, performance, and reliability in operational environments.\nDocument technical workflows, methodologies, and results clearly for internal teams.\nCommunicate technical concepts and solutions effectively to both technical and non-technical stakeholders.\n\nRequirements\n\nStrong proficiency in Python for data processing, automation, and machine learning development.\nHands-on experience with machine learning frameworks and model development workflows.\nExperience working with JSON data structures and API integrations.\nAbility to translate business requirements into deployable AI solutions.\nStrong written and verbal communication skills with attention to clarity and collaboration.\nFamiliarity with version control systems and collaborative development tools.\nSelf-motivated and comfortable working in a fast-paced remote environment.\n\nApplication Process (Takes 20 Min)\n\nUpload resume\nInterview (15 min)\nSubmit form\n\n\n\n─░stenen Yetenek ve Uzmanl─▒klar\nMachine Learning, AI	\N	["Machine Learning", "AI", "Python", "Data Processing", "Automation", "API Development", "Data Pipelines", "Model Optimization", "Scalability", "JSON Data Structures", "API Integration", "Machine Learning Frameworks", "Version Control Systems", "Data Analysis"]	2026-03-16 12:21:18.945	2026-03-16 12:21:18.945
4	Makine M├╝hendisi	\N	─░┼ş ─░lan─▒ Hakk─▒nda\n─░stanbul Anadolu Yakas─▒nda yap─▒lacak olan  Karma Konut Projemizin ┼şantiyesinde g├Ârevlendirilmek ├╝zere Pendik b├Âlgesi ve civar─▒nda ikamet eden ;\n\n├£niversitelerin Makine M├╝hendisli─şi b├Âl├╝m├╝nden mezun,\n├çoklu proje y├Ânetiminde deneyim sahibi, e┼şzamanl─▒ birden ├ğok projeyi y├Ânetebilecek yeterlilikte olan,\nTercihen b├╝y├╝k ├Âl├ğekli ve nitelikli ├╝st yap─▒(karma konut) projelerinde Makine M├╝hendisi g├Ârevinde 8-12 y─▒l tecr├╝beli,\nIs─▒tma, So─şutma, Havaland─▒rma Tesisatlar─▒, S─▒hhi Tesisat, Yang─▒n Tesisat─▒, Bina Mekanik Otomasyonu konular─▒nda  saha tecr├╝besi  olan,\nPlanlama, ha kedi┼ş konular─▒nda deneyimli,\nMS Office uygulamalar─▒na ve Autocad program─▒na h├ókim,\nEkip ve ta┼şeron y├Ânetimi konular─▒nda deneyimli,\nMalzeme, uygulama, test ve devreye alma konular─▒nda tecr├╝be sahibi, detay ├ğ├Âz├╝m bilgisi y├╝ksek,\nEtkin ileti┼şim becerisine sahip, insan ili┼şkilerinde ba┼şar─▒l─▒, m├╝zakere yetene─şi geli┼şmi┼ş,\nAnalitik d├╝┼ş├╝nebilme yetene─şine sahip,\nErkek adaylar i├ğin askerlik ile ili┼şi─şi olmayan,\n\n\n─░┼Ş TANIMI \n\nSaha uygulama ve detay projelerinin haz─▒rlat─▒lmas─▒n─▒n organizasyonu,\nStatik, mimari ve elektrik imalatlar─▒ ile koordinasyonunun sa─şlanmas─▒,\nTa┼şeron firman─▒n yapm─▒┼ş oldu─şu b├╝t├╝n imalatlar─▒n yerinde kontrol├╝ ve denetimi,\nSat─▒nalma teknik dosyalar─▒n─▒n olu┼şturulmas─▒,\nMetraj, ke┼şif ve hak edi┼ş yap─▒lmas─▒ ve kontrol├╝,\n─░┼ş sonu hak edi┼ş d├╝zenleyip, sorunsuz ┼şekilde i┼ş teslim onaylar─▒n─▒n al─▒nmas─▒, \nAl─▒nan malzemelerin ┼şantiyeye sevk ve takibinin yap─▒lmas─▒,\n\n\nAday Kriterleri\nÔÇó Tecr├╝be\nEn az 8 y─▒l tecr├╝beli\nÔÇó E─şitim Seviyesi\n├£niversite(Mezun), Y├╝ksek Lisans(Mezun)\nÔÇó Askerlik Durumu\nYap─▒ld─▒	\N	["├çoklu proje y├Ânetimi", "Is─▒tma, So─şutma, Havaland─▒rma Tesisatlar─▒ (HVAC)", "S─▒hhi Tesisat", "Yang─▒n Tesisat─▒", "Bina Mekanik Otomasyonu", "Saha tecr├╝besi (Mekanik tesisat konular─▒nda)", "Planlama", "Hak edi┼ş (Metraj, ke┼şif, kontrol)", "MS Office", "Autocad", "Ekip y├Ânetimi", "Ta┼şeron y├Ânetimi", "Malzeme bilgisi", "Uygulama bilgisi", "Test ve devreye alma", "Detay ├ğ├Âz├╝m bilgisi", "Etkin ileti┼şim", "M├╝zakere yetene─şi", "Analitik d├╝┼ş├╝nme"]	2026-03-18 10:02:16.759	2026-03-18 10:02:16.759
5	Makine M├╝hendisi	\N	─░┼ş ─░lan─▒ Hakk─▒nda\n─░stanbul Anadolu Yakas─▒nda yap─▒lacak olan  Karma Konut Projemizin ┼şantiyesinde g├Ârevlendirilmek ├╝zere Pendik b├Âlgesi ve civar─▒nda ikamet eden ;\n\n├£niversitelerin Makine M├╝hendisli─şi b├Âl├╝m├╝nden mezun,\n├çoklu proje y├Ânetiminde deneyim sahibi, e┼şzamanl─▒ birden ├ğok projeyi y├Ânetebilecek yeterlilikte olan,\nTercihen b├╝y├╝k ├Âl├ğekli ve nitelikli ├╝st yap─▒(karma konut) projelerinde Makine M├╝hendisi g├Ârevinde 8-12 y─▒l tecr├╝beli,\nIs─▒tma, So─şutma, Havaland─▒rma Tesisatlar─▒, S─▒hhi Tesisat, Yang─▒n Tesisat─▒, Bina Mekanik Otomasyonu konular─▒nda  saha tecr├╝besi  olan,\nPlanlama, ha kedi┼ş konular─▒nda deneyimli,\nMS Office uygulamalar─▒na ve Autocad program─▒na h├ókim,\nEkip ve ta┼şeron y├Ânetimi konular─▒nda deneyimli,\nMalzeme, uygulama, test ve devreye alma konular─▒nda tecr├╝be sahibi, detay ├ğ├Âz├╝m bilgisi y├╝ksek,\nEtkin ileti┼şim becerisine sahip, insan ili┼şkilerinde ba┼şar─▒l─▒, m├╝zakere yetene─şi geli┼şmi┼ş,\nAnalitik d├╝┼ş├╝nebilme yetene─şine sahip,\nErkek adaylar i├ğin askerlik ile ili┼şi─şi olmayan,\n\n\n─░┼Ş TANIMI \n\nSaha uygulama ve detay projelerinin haz─▒rlat─▒lmas─▒n─▒n organizasyonu,\nStatik, mimari ve elektrik imalatlar─▒ ile koordinasyonunun sa─şlanmas─▒,\nTa┼şeron firman─▒n yapm─▒┼ş oldu─şu b├╝t├╝n imalatlar─▒n yerinde kontrol├╝ ve denetimi,\nSat─▒nalma teknik dosyalar─▒n─▒n olu┼şturulmas─▒,\nMetraj, ke┼şif ve hak edi┼ş yap─▒lmas─▒ ve kontrol├╝,\n─░┼ş sonu hak edi┼ş d├╝zenleyip, sorunsuz ┼şekilde i┼ş teslim onaylar─▒n─▒n al─▒nmas─▒, \nAl─▒nan malzemelerin ┼şantiyeye sevk ve takibinin yap─▒lmas─▒,\n\n\nAday Kriterleri\nÔÇó Tecr├╝be\nEn az 8 y─▒l tecr├╝beli\nÔÇó E─şitim Seviyesi\n├£niversite(Mezun), Y├╝ksek Lisans(Mezun)\nÔÇó Askerlik Durumu\nYap─▒ld─▒	\N	["├çoklu Proje Y├Ânetimi", "Is─▒tma Tesisatlar─▒", "So─şutma Tesisatlar─▒", "Havaland─▒rma Tesisatlar─▒", "S─▒hhi Tesisat", "Yang─▒n Tesisat─▒", "Bina Mekanik Otomasyonu", "Saha Tecr├╝besi (Mekanik Tesisat)", "Planlama", "Hak Edi┼ş (Metraj, Ke┼şif, Kontrol)", "MS Office", "Autocad", "Ekip Y├Ânetimi", "Ta┼şeron Y├Ânetimi", "Malzeme Bilgisi", "Uygulama Bilgisi", "Test ve Devreye Alma", "Detay ├ç├Âz├╝m Bilgisi", "Etkin ─░leti┼şim Becerisi", "─░nsan ─░li┼şkileri Y├Ânetimi", "M├╝zakere Yetene─şi", "Analitik D├╝┼ş├╝nme", "Saha Uygulama ve Detay Projeleri Organizasyonu", "─░malat Koordinasyonu (Statik, Mimari, Elektrik)", "Ta┼şeron ─░malat Kontrol ve Denetimi", "Sat─▒nalma Teknik Dosyas─▒ Olu┼şturma", "Malzeme Sevk ve Takibi", "─░┼ş Teslim Onaylar─▒ Alma"]	2026-03-18 10:04:11.812	2026-03-18 10:04:11.812
6	Saha ─░n┼şaat M├╝hendisi	\N	ARANAN N─░TEL─░KLER\n\n├£niversitelerin Makine M├╝hendisli─şi b├Âl├╝mlerinden mezun,\nEnd├╝striyel tesis tecr├╝besi olan, tercihen ├ğimento ve/veya al├ğ─▒,\nSaha ─░n┼şaat M├╝hendisi olarak min. 5 y─▒l deneyimli, (  yurtd─▒┼ş─▒ tecr├╝besi tercihen Afrika ├╝lkeleri. )\n─░yi d├╝zeyde ─░ngilizce okuma, yazma ve konu┼şma bilgisine sahip olan,\nTercihen Frans─▒zca bilen,\nMsOffice ve AutoCAD programlar─▒n─▒ etkin d├╝zeyde kullanabilen,\nPlanlama, i┼ş takibi ve koordinasyon becerilerini etkin d├╝zeyde kullanabilen, sorumluluk sahibi, problem ├ğ├Âzme yetene─şi geli┼şmi┼ş, hedef ve sonu├ğ odakl─▒,\nYurt i├ği ve Yurt d─▒┼ş─▒ seyahat engeli bulunmayan,\nErkek adaylar i├ğin askerlik hizmetini tamamlam─▒┼ş,\n─░┼Ş TANIMI  \n\nT├╝m saha aktivitelerinin g├╝nl├╝k / haftal─▒k ve ayl─▒k plan ve program─▒n─▒n yap─▒lmas─▒, ┼şantiyenin sevk ve idaresi,\nT├╝m disiplinler aras─▒ i┼ş b├Âl├╝m├╝n├╝n yap─▒lmas─▒,\nYurt i├ği ve yurt d─▒┼ş─▒ sat─▒nalma takibinin yap─▒lmas─▒,\nM├╝┼şavir ve ─░┼şveren firma ile gerekli saha koordinasyonunun yap─▒lmas─▒,\n─░┼ş program─▒na g├Âre malzeme teminlerinin planlanmas─▒,	\N	["─░ngilizce (─░yi D├╝zey)", "Frans─▒zca (Tercihen)", "MsOffice", "AutoCAD", "Planlama", "─░┼ş Takibi", "Koordinasyon", "Sorumluluk Sahibi", "Problem ├ç├Âzme", "Hedef Odakl─▒", "Sonu├ğ Odakl─▒"]	2026-03-18 10:11:13.164	2026-03-18 10:11:13.164
7	Saha ─░n┼şaat M├╝hendisi	\N	ARANAN N─░TEL─░KLER\n\n├£niversitelerin Makine M├╝hendisli─şi b├Âl├╝mlerinden mezun,\nEnd├╝striyel tesis tecr├╝besi olan, tercihen ├ğimento ve/veya al├ğ─▒,\nSaha ─░n┼şaat M├╝hendisi olarak min. 5 y─▒l deneyimli, (  yurtd─▒┼ş─▒ tecr├╝besi tercihen Afrika ├╝lkeleri. )\n─░yi d├╝zeyde ─░ngilizce okuma, yazma ve konu┼şma bilgisine sahip olan,\nTercihen Frans─▒zca bilen,\nMsOffice ve AutoCAD programlar─▒n─▒ etkin d├╝zeyde kullanabilen,\nPlanlama, i┼ş takibi ve koordinasyon becerilerini etkin d├╝zeyde kullanabilen, sorumluluk sahibi, problem ├ğ├Âzme yetene─şi geli┼şmi┼ş, hedef ve sonu├ğ odakl─▒,\nYurt i├ği ve Yurt d─▒┼ş─▒ seyahat engeli bulunmayan,\nErkek adaylar i├ğin askerlik hizmetini tamamlam─▒┼ş,\n─░┼Ş TANIMI  \n\nT├╝m saha aktivitelerinin g├╝nl├╝k / haftal─▒k ve ayl─▒k plan ve program─▒n─▒n yap─▒lmas─▒, ┼şantiyenin sevk ve idaresi,\nT├╝m disiplinler aras─▒ i┼ş b├Âl├╝m├╝n├╝n yap─▒lmas─▒,\nYurt i├ği ve yurt d─▒┼ş─▒ sat─▒nalma takibinin yap─▒lmas─▒,\nM├╝┼şavir ve ─░┼şveren firma ile gerekli saha koordinasyonunun yap─▒lmas─▒,\n─░┼ş program─▒na g├Âre malzeme teminlerinin planlanmas─▒,	\N	["─░ngilizce (iyi d├╝zey)", "Frans─▒zca (tercihen)", "MsOffice kullan─▒m─▒", "AutoCAD kullan─▒m─▒", "Planlama", "─░┼ş takibi", "Koordinasyon", "Problem ├ğ├Âzme", "Sorumluluk", "Hedef ve sonu├ğ odakl─▒l─▒k"]	2026-03-18 10:43:54.325	2026-03-18 10:43:54.325
8	Saha ─░n┼şaat M├╝hendisi	\N	ARANAN N─░TEL─░KLER\n\n├£niversitelerin Makine M├╝hendisli─şi b├Âl├╝mlerinden mezun,\nEnd├╝striyel tesis tecr├╝besi olan, tercihen ├ğimento ve/veya al├ğ─▒,\nSaha ─░n┼şaat M├╝hendisi olarak min. 5 y─▒l deneyimli, (  yurtd─▒┼ş─▒ tecr├╝besi tercihen Afrika ├╝lkeleri. )\n─░yi d├╝zeyde ─░ngilizce okuma, yazma ve konu┼şma bilgisine sahip olan,\nTercihen Frans─▒zca bilen,\nMsOffice ve AutoCAD programlar─▒n─▒ etkin d├╝zeyde kullanabilen,\nPlanlama, i┼ş takibi ve koordinasyon becerilerini etkin d├╝zeyde kullanabilen, sorumluluk sahibi, problem ├ğ├Âzme yetene─şi geli┼şmi┼ş, hedef ve sonu├ğ odakl─▒,\nYurt i├ği ve Yurt d─▒┼ş─▒ seyahat engeli bulunmayan,\nErkek adaylar i├ğin askerlik hizmetini tamamlam─▒┼ş,\n─░┼Ş TANIMI  \n\nT├╝m saha aktivitelerinin g├╝nl├╝k / haftal─▒k ve ayl─▒k plan ve program─▒n─▒n yap─▒lmas─▒, ┼şantiyenin sevk ve idaresi,\nT├╝m disiplinler aras─▒ i┼ş b├Âl├╝m├╝n├╝n yap─▒lmas─▒,\nYurt i├ği ve yurt d─▒┼ş─▒ sat─▒nalma takibinin yap─▒lmas─▒,\nM├╝┼şavir ve ─░┼şveren firma ile gerekli saha koordinasyonunun yap─▒lmas─▒,\n─░┼ş program─▒na g├Âre malzeme teminlerinin planlanmas─▒,	\N	["─░ngilizce (iyi d├╝zeyde)", "Frans─▒zca (tercihen)", "MsOffice kullan─▒m─▒ (etkin)", "AutoCAD kullan─▒m─▒ (etkin)", "Planlama becerisi", "─░┼ş takibi becerisi", "Koordinasyon becerisi", "Sorumluluk sahibi olma", "Problem ├ğ├Âzme yetene─şi", "Hedef ve sonu├ğ odakl─▒l─▒k"]	2026-03-18 10:52:46.008	2026-03-18 10:52:46.008
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."Post" (id, content, "authorId", "createdAt") FROM stdin;
1		3	2026-03-05 07:34:21.758
2	cv'mi inceleyin	4	2026-03-05 07:45:20.018
\.


--
-- Data for Name: PostImage; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."PostImage" (id, url, "fileId", "postId", "createdAt") FROM stdin;
1	https://drive.google.com/uc?export=view&id=152j7CIowR8x9vLFsZb5hHxG4eIOKKUtF	152j7CIowR8x9vLFsZb5hHxG4eIOKKUtF	1	2026-03-05 07:34:21.758
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."Profile" (id, bio, phone, "userId") FROM stdin;
\.


--
-- Data for Name: ProfileImage; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."ProfileImage" (id, url, "fileId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TailoredCV; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."TailoredCV" (id, "userId", "jobPostingId", "originalCvId", "atsScore", "improvedSummary", "createdAt", "updatedAt", "fileId") FROM stdin;
3	3	3	18	\N	Uygulamal─▒ Yapay Zeka M├╝hendisi olarak kariyer hedefleyen, Bilgisayar M├╝hendisli─şi son s─▒n─▒f ├Â─şrencisiyim. Python, makine ├Â─şrenimi ve derin ├Â─şrenme modellerini tasarlama, geli┼ştirme ve ├╝retim sistemlerine da─ş─▒tma konusunda g├╝├ğl├╝ bir yetkinli─şe sahibim. B├╝y├╝k ├Âl├ğekli veri setleri ├╝zerinde ├ğal─▒┼şarak veri i┼şlem hatt─▒ (data pipeline) olu┼şturma, API entegrasyonu ve model performans optimizasyonu konular─▒nda deneyimliyim. Uzak (remote) ├ğal─▒┼şma ortam─▒nda i┼şbirlik├ği geli┼ştirme ara├ğlar─▒ ve versiyon kontrol sistemleri kullanarak ger├ğek d├╝nya i┼ş problemlerine ├Âl├ğeklenebilir ve g├╝venilir yapay zeka ├ğ├Âz├╝mleri ├╝retmeye haz─▒r─▒m.	2026-03-16 12:22:40.088	2026-03-16 13:07:17.743	1EAQYh8s2wqJo9HX9rXqFigor8g8w2ZJu
2	3	2	18	\N	Son s─▒n─▒f Bilgisayar M├╝hendisli─şi ├Â─şrencisi olarak, Node.js ve Express.js tabanl─▒ kapsaml─▒ projelerde edindi─şim tam y─▒─ş─▒n geli┼ştirme tecr├╝belerimi, Nodelabs Software'in dinamik startup ortam─▒na ta┼ş─▒maya haz─▒r─▒m. ├ûl├ğeklenebilir backend servisleri geli┼ştirmede, veritaban─▒ y├Ânetimi (ili┼şkisel ve NoSQL'e adaptasyon), API entegrasyonlar─▒ ve temel d├╝zeyde frontend (ReactJS ve y├Ânetim paneli ┼şablonlar─▒) yetkinim. Temiz kod prensipleriyle ├ğal─▒┼şarak, performans odakl─▒ ├ğ├Âz├╝mler ├╝retmeyi ve yenilik├ği mobil uygulamalar─▒n b├╝y├╝mesine anlaml─▒ katk─▒lar sa─şlamay─▒ hedefliyorum.	2026-03-16 08:39:20.084	2026-03-18 09:42:14.01	17nH7A2-FS0h9AUWEkjdWFCJhJCXZzc2X
1	3	1	18	\N	Son s─▒n─▒f Bilgisayar M├╝hendisli─şi ├Â─şrencisi olarak, ├Âzellikle Node.js ve Express.js tabanl─▒ backend geli┼ştirme ile g├╝├ğl├╝ bir full-stack yetkinli─şine sahibim. ─░li┼şkisel veritaban─▒ tasar─▒m─▒ (MySQL, Sequelize ORM) ve y├Ânetiminde deneyimliyim ve modern ├Ân y├╝z teknolojilerine (EJS, Bootstrap) a┼şinal─▒─ş─▒m var. Geli┼ştirdi─şim projelerde ├Âl├ğeklenebilir, performans odakl─▒ sistemler kurmaya ve mod├╝ler kod yaz─▒m─▒na odakland─▒m. Dinamik bir startup ortam─▒nda sorumluluk alarak yenilik├ği mobil uygulama ve altyap─▒ projelerine katk─▒da bulunmaya haz─▒r─▒m.	2026-03-16 08:25:26.361	2026-03-18 09:57:39.062	1FBp8sFawCkKM6us96IIfjnj12SioxcW5
6	3	7	21	\N	Makine m├╝hendisli─şi alan─▒nda 12 y─▒l─▒ a┼şk─▒n saha ve proje y├Ânetimi deneyimine sahip bir m├╝hendis olarak, end├╝striyel tesislerde ├╝retim s├╝re├ğlerinin optimizasyonu, mekanik tasar─▒m projelerinin liderli─şi ve sahada operasyonel sorun giderme konular─▒nda kapsaml─▒ bilgi birikimine sahibim. G├╝├ğl├╝ analitik d├╝┼ş├╝nme, problem ├ğ├Âzme, planlama ve koordinasyon becerilerimle projeleri zaman─▒nda ve b├╝t├ğe dahilinde y├Âneterek hedefe y├Ânelik sonu├ğlar elde ettim. Yurt i├ği ve yurt d─▒┼ş─▒ seyahat engelim bulunmamakta olup, uluslararas─▒ saha m├╝hendisli─şi projelerinde etkin rol almaya istekliyim.	2026-03-18 10:44:29.023	2026-03-18 10:44:29.023	\N
7	3	7	21	\N	Makine m├╝hendisli─şi alan─▒nda 12 y─▒l─▒ a┼şk─▒n saha ve proje y├Ânetimi deneyimine sahip bir m├╝hendis olarak, end├╝striyel tesislerde ├╝retim s├╝re├ğlerinin optimizasyonu, mekanik tasar─▒m projelerinin liderli─şi ve sahada operasyonel sorun giderme konular─▒nda kapsaml─▒ bilgi birikimine sahibim. G├╝├ğl├╝ analitik d├╝┼ş├╝nme, problem ├ğ├Âzme, planlama ve koordinasyon becerilerimle projeleri zaman─▒nda ve b├╝t├ğe dahilinde y├Âneterek hedefe y├Ânelik sonu├ğlar elde ettim. Yurt i├ği ve yurt d─▒┼ş─▒ seyahat engelim bulunmamakta olup, uluslararas─▒ saha m├╝hendisli─şi projelerinde etkin rol almaya istekliyim.	2026-03-18 10:44:39.397	2026-03-18 10:44:39.397	\N
9	3	8	21	\N	Makine M├╝hendisli─şi alan─▒nda edindi─şim 12 y─▒ll─▒k kapsaml─▒ deneyimle, ├Âzellikle end├╝striyel tesis projelerinde tasar─▒m, ├╝retim s├╝re├ğleri y├Ânetimi ve verimlilik optimizasyonu konular─▒nda uzmanla┼şt─▒m. Analitik d├╝┼ş├╝nme ve geli┼şmi┼ş problem ├ğ├Âzme yetene─şimi, karma┼ş─▒k projelerin planlanmas─▒, i┼ş takibi ve t├╝m payda┼şlar aras─▒ koordinasyonunda etkin bir ┼şekilde kulland─▒m. Saha operasyonlar─▒n─▒n dinamiklerine h─▒zla adapte olabilen, hedef ve sonu├ğ odakl─▒ bir profesyonel olarak, yurt i├ği ve yurt d─▒┼ş─▒ in┼şaat/tesis projelerinde saha y├Ânetim s├╝re├ğlerine katk─▒ sa─şlamaya istekliyim. ─░yi derecede ─░ngilizce ve temel Frans─▒zca bilgisine sahibim.	2026-03-18 10:55:58.196	2026-03-18 10:55:58.196	\N
8	3	7	21	\N	Makine m├╝hendisli─şi alan─▒nda 12 y─▒l─▒ a┼şk─▒n saha ve proje y├Ânetimi deneyimine sahip bir m├╝hendis olarak, end├╝striyel tesislerde ├╝retim s├╝re├ğlerinin optimizasyonu, mekanik tasar─▒m projelerinin liderli─şi ve sahada operasyonel sorun giderme konular─▒nda kapsaml─▒ bilgi birikimine sahibim. G├╝├ğl├╝ analitik d├╝┼ş├╝nme, problem ├ğ├Âzme, planlama ve koordinasyon becerilerimle projeleri zaman─▒nda ve b├╝t├ğe dahilinde y├Âneterek hedefe y├Ânelik sonu├ğlar elde ettim. Yurt i├ği ve yurt d─▒┼ş─▒ seyahat engelim bulunmamakta olup, uluslararas─▒ saha m├╝hendisli─şi projelerinde etkin rol almaya istekliyim.	2026-03-18 10:52:25.325	2026-03-18 10:56:21.723	1YCtO0UnJA1GWpFDAxt0xfJKyR41htog-
\.


--
-- Data for Name: TailoredCVEntry; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."TailoredCVEntry" (id, "tailoredCvId", category, name, description, "isModified", "aiComment", "createdAt") FROM stdin;
1	1	SKILL	Belirtilmemi┼ş	Node.js, JavaScript (ES6+), Python, SQL	t	─░┼ş ilan─▒nda Node.js ve JavaScript anahtar teknolojiler oldu─şundan, bu becerileri programlama dilleri aras─▒nda en ba┼şa alarak ve g├╝ncel JavaScript (ES6+) vurgusu yaparak aday─▒n yetkinli─şini ├Ân plana ├ğ─▒kar─▒r.	2026-03-16 08:25:26.379
2	1	SKILL	Belirtilmemi┼ş	Sequelize ORM (ili┼şkisel veritabanlar─▒ i├ğin), Express.js (API geli┼ştirme), Pandas, NumPy	t	─░┼ş ilan─▒ndaki backend ve veritaban─▒ gereksinimleri do─şrultusunda Sequelize ORM ve Express.js kullan─▒m─▒ndaki yetkinli─şi vurgular. Di─şer veri bilimi k├╝t├╝phaneleri daha az ├Âncelikli olsa da, genel programlama yetene─şini g├Âsterir.	2026-03-16 08:25:26.379
3	1	SKILL	Belirtilmemi┼ş	Makine ├û─şrenimi ve Derin ├û─şrenim algoritmalar─▒ geli┼ştirme (verimli modelleme ve optimizasyon deneyimi), Do─şal Dil ─░┼şleme	t	Aday─▒n veri bilimi becerileri g├╝├ğl├╝ olsa da, i┼ş ilan─▒ daha ├ğok full-stack geli┼ştirmeye odakland─▒─ş─▒ i├ğin, bu yeteneklerin yaz─▒l─▒m geli┼ştirme ve problem ├ğ├Âzme ba─şlam─▒ndaki katk─▒lar─▒ vurgulanarak daha alakal─▒ hale getirilebilir.	2026-03-16 08:25:26.379
4	1	SKILL	Belirtilmemi┼ş	Node.js, Express.js (RESTful API geli┼ştirme, ├Âl├ğeklenebilir backend mimarileri), Mod├╝ler Kod Yaz─▒m─▒	t	─░┼ş ilan─▒nda aranan temel backend teknolojileri olan Node.js ve Express.js'i, ilandaki 'API geli┼ştirme' ve 'mod├╝ler kod yaz─▒m─▒' gibi anahtar ifadelerle birle┼ştirerek aday─▒n bu alandaki derinli─şini ve yetkinli─şini g├Âsterir.	2026-03-16 08:25:26.379
5	1	SKILL	Belirtilmemi┼ş	HTML5, CSS3, JavaScript, EJS (Sunucu Tabanl─▒ ┼Şablonlama), Bootstrap 5, Responsive Design, Temel d├╝zeyde ReactJS ve haz─▒r admin panel ┼şablonlar─▒ (dashboard entegrasyonu)	t	─░┼ş ilan─▒nda belirtilen temel ReactJS bilgisi ve haz─▒r admin panel ┼şablonlar─▒ kullanma tecr├╝besi beklentisine yan─▒t verir. Aday─▒n mevcut Frontend becerilerini i┼ş ilan─▒n─▒n gereklilikleriyle daha uyumlu hale getirir.	2026-03-16 08:25:26.379
6	1	SKILL	Belirtilmemi┼ş	MySQL, ─░li┼şkisel Veritaban─▒ Tasar─▒m─▒, Sequelize ORM. NoSQL (MongoDB) ve mesaj kuyruk sistemleri (RabbitMQ), cache (Redis) mimarilerine ├Â─şrenmeye a├ğ─▒k ve h─▒zl─▒ adapte olabilme yetene─şi.	t	─░┼ş ilan─▒nda vurgulanan MongoDB, Redis, RabbitMQ ve Elasticsearch gibi NoSQL ve da─ş─▒t─▒k sistem teknolojilerine direkt deneyimi olmasa da, g├╝├ğl├╝ ili┼şkisel veritaban─▒ altyap─▒s─▒yla bu yeni teknolojileri h─▒zl─▒ca ├Â─şrenebilece─şini ve adapte olabilece─şini g├Âstererek aday─▒n esnekli─şini vurgular.	2026-03-16 08:25:26.379
7	1	PROJECT	U├ğu┼ş Gecikmesi Tahmini: B├╝y├╝k ├ûl├ğekli Veri ─░┼şleme ve Web Da─ş─▒t─▒m─▒	Python, Scikit-Learn, PyTorch, XGBoost, TimesFM, Flask ile u├ğu┼ş gecikmesi tahmini: 454.000+ u├ğu┼ş kayd─▒ ve ger├ğek zamanl─▒ meteorolojik verileri entegre eden **b├╝y├╝k ├Âl├ğekli bir veri hatt─▒** olu┼şturuldu. Y├╝ksek do─şrulukta regresyon modelleri geli┼ştirilerek %91.9 R┬▓ skoru elde edildi. Flask kullanarak kullan─▒c─▒ dostu bir **web uygulamas─▒ olarak da─ş─▒t─▒m─▒** yap─▒ld─▒, dinamik gecikme tahminleri sa─şland─▒.	t	Bu proje, adaydaki g├╝├ğl├╝ veri i┼şleme, yaz─▒l─▒m mimarisi ve da─ş─▒t─▒m yeteneklerini g├Âsterse de, Full Stack rol├╝ i├ğin kritik olmayan makine ├Â─şrenimi detaylar─▒n─▒ azaltarak, projenin yaz─▒l─▒m m├╝hendisli─şi ve API entegrasyonu y├Ânlerini daha belirgin hale getirir.	2026-03-16 08:25:26.379
8	1	PROJECT	NoteHub ÔÇô E─şitim Y├Ânetim Platformu (LMS)	Node.js, Express, MySQL, Sequelize ORM, EJS (MVC Mimarisi) kullan─▒larak geli┼ştirilen kapsaml─▒ bir E─şitim Y├Ânetim Sistemi (LMS) projesi:\nÔÇó Node.js ve Express ile ├Âl├ğeklenebilir ve **mod├╝ler bir MVC yap─▒s─▒** ile **backend servisleri** geli┼ştirildi.\nÔÇó RBAC (Role-Based Access Control) gibi g├╝├ğl├╝ g├╝venlik ├Âzellikleri ve ├ğat─▒┼şmas─▒z randevu planlama algoritmas─▒ tasarland─▒. **Temiz, okunabilir ve s├╝rd├╝r├╝lebilir kod** yaz─▒m─▒na odaklan─▒ld─▒.\nÔÇó Kaynak payla┼ş─▒m─▒, ├Âdev g├Ânderimleri ve kullan─▒c─▒ verilerini etkin bir ┼şekilde y├Ânetmek i├ğin MySQL ve Sequelize ORM ile karma┼ş─▒k **ili┼şkisel veritaban─▒ ┼şemalar─▒** olu┼şturuldu. **NoSQL (MongoDB) veritabanlar─▒na adapte olabilme** yetene─şi kazan─▒ld─▒.	t	Bu proje, i┼ş ilan─▒ndaki Node.js, Express.js, backend geli┼ştirme, veritaban─▒ y├Ânetimi ve s├╝rd├╝r├╝lebilir kod yaz─▒m─▒ gibi bir├ğok anahtar gereksinimle do─şrudan ├Ârt├╝┼şmektedir. A├ğ─▒klamay─▒ i┼ş ilan─▒ndaki terimlerle zenginle┼ştirerek aday─▒n bu alandaki deneyimini ve potansiyelini daha net vurgular.	2026-03-16 08:25:26.379
9	1	PROJECT	T├╝rk├ğe ┼Şark─▒ S├Âzleri Duygu Analizi (BERT ile)	NLP, BERT, Transfer Learning, Flask, Web Scraping kullan─▒larak T├╝rk├ğe ┼şark─▒ s├Âzleri i├ğin **u├ğtan uca bir duygu analizi sistemi**:\nÔÇó Transfer ├û─şrenimi teknikleri kullan─▒larak T├╝rk├ğe ┼şark─▒ s├Âzleri i├ğin ├ğok s─▒n─▒fl─▒ bir duygu s─▒n─▒fland─▒rma sistemi geli┼ştirildi.\nÔÇó Ham web'den kaz─▒nan verileri otomatik olarak etiketlemek i├ğin S─▒f─▒r ├çekim ├û─şrenimi (Pseudo-Labeling) uyguland─▒, y├╝ksek kaliteli bir e─şitim veri seti olu┼şturuldu.\nÔÇó ├ûnceden e─şitilmi┼ş bir BERT mimarisi ince ayarland─▒ ve Flask kullanarak **ger├ğek zamanl─▒ bir RESTful API** olarak da─ş─▒t─▒m─▒ yap─▒ld─▒.	t	Veri bilimi a─ş─▒rl─▒kl─▒ olsa da, projenin 'u├ğtan uca pipeline', 'veri m├╝hendisli─şi' ve 'Flask ile RESTful API da─ş─▒t─▒m─▒' gibi yaz─▒l─▒m m├╝hendisli─şi y├Ânleri ├Ân plana ├ğ─▒kar─▒larak, aday─▒n genel geli┼ştirme yetkinli─şi vurgulan─▒r.	2026-03-16 08:25:26.379
10	1	PROJECT	Yapay Zeka Destekli Kimlik Av─▒ Tespit ve Kategorizasyon Sistemi	Derin ├û─şrenme (XLM-RoBERTa), LLM (Mistral), Siber G├╝venlik ile yapay zeka destekli bir kimlik av─▒ tespit ve kategorizasyon sistemi:\nÔÇó Derin ├û─şrenme (XLM-RoBERTa) ile kural tabanl─▒ ├Âzellik ├ğ─▒karma (URL analizi, IP kullan─▒m─▒) birle┼ştiren hibrit bir tespit motoru geli┼ştirildi.\nÔÇó Hem ikili s─▒n─▒fland─▒rma (G├╝venli vs. Kimlik Av─▒) hem de k├Ât├╝ ama├ğl─▒ i├ğerik i├ğin ayr─▒nt─▒l─▒ kategori tahmini yapacak bir model tasarland─▒.\nÔÇó Kullan─▒c─▒lara tespit edilen g├╝venlik tehditleri i├ğin insan taraf─▒ndan okunabilir a├ğ─▒klamalar sa─şlamak ├╝zere iste─şe ba─şl─▒ bir Mistral LLM ile entegre, **interaktif bir web aray├╝z├╝** uyguland─▒.	t	Bu projenin karma┼ş─▒k sistem tasar─▒m─▒, web aray├╝z├╝ entegrasyonu ve ileri d├╝zey teknolojileri (LLM) kullanma becerisi, aday─▒n Full Stack Developer rol├╝nde de─şer katabilecek analitik ve teknik yeteneklerini sergiler.	2026-03-16 08:25:26.379
11	1	EXPERIENCE	Belirtilmemi┼ş	Practicus AI platformunu kullanarak ham veri al─▒m─▒ndan model e─şitimine kadar **u├ğtan uca bir veri bilimi ya┼şam d├Âng├╝s├╝**n├╝ y├╝r├╝tt├╝m. Makine ├Â─şrenimi g├Ârevleri i├ğin y├╝ksek kaliteli veri setleri haz─▒rlamak ├╝zere titiz veri temizleme, eksik de─şer analizi ve ayk─▒r─▒ de─şer tespiti yapt─▒m. ─░┼şlenen veri setleri ├╝zerinde denetimli ├Â─şrenme modelleri e─şittim ve tahmin do─şrulu─şunu optimize etmek i├ğin performans metriklerini analiz ettim. Veri manip├╝lasyonu, istatistiksel analiz ve ├Âzellik m├╝hendisli─şi i├ğin **Python (Pandas, Scikit-learn) ve SQL** kulland─▒m.	t	Bu deneyim veri bilimi a─ş─▒rl─▒kl─▒ olsa da, aday─▒n 'u├ğtan uca geli┼ştirme s├╝reci', 'veri i┼şleme' ve 'SQL' yeteneklerini vurgulayarak, bir Full Stack Developer olarak veri entegrasyonu ve y├Ânetimindeki potansiyelini ortaya koyar. Ayr─▒ca, yaz─▒l─▒m geli┼ştirme metodolojilerine olan a┼şinal─▒─ş─▒n─▒ da destekler.	2026-03-16 08:25:26.379
12	2	EXPERIENCE	Belirtilmemi┼ş	U├ğtan Uca Yaz─▒l─▒m Geli┼ştirme Ya┼şam D├Âng├╝s├╝: Veri al─▒m─▒ndan model da─ş─▒t─▒m─▒na kadar t├╝m s├╝re├ğleri i├ğeren bir platformda ├ğal─▒┼şt─▒m, bu s├╝re├ğte analitik ve yaz─▒l─▒m geli┼ştirme becerilerimi kulland─▒m.\nVeri ├ûn ─░┼şleme ve Optimizasyon: Y├╝ksek kaliteli veri setleri olu┼şturmak i├ğin veri temizli─şi, eksik de─şer analizi ve ayk─▒r─▒ de─şer tespiti gibi titiz veri ├Ân i┼şleme ad─▒mlar─▒ ger├ğekle┼ştirdim.\nModel Geli┼ştirme ve Performans Analizi: ─░┼şlenmi┼ş veri setleri ├╝zerinde denetimli ├Â─şrenme modelleri e─şittim ve tahmin do─şrulu─şunu optimize etmek i├ğin performans metriklerini analiz ettim.\nTeknik Y─▒─ş─▒n: Veri manip├╝lasyonu, istatistiksel analiz ve ├Âzellik m├╝hendisli─şi i├ğin Python (Pandas, Scikit-learn) ve SQL kulland─▒m.	t	Staj deneyimindeki 'Data Science' odakl─▒ ifadeleri daha genel 'yaz─▒l─▒m geli┼ştirme', 'performans analizi' ve 'sistem optimizasyonu' becerilerini vurgulayacak ┼şekilde de─şi┼ştirmek, aday─▒n analitik ve problem ├ğ├Âzme yetene─şini Full Stack rol├╝ i├ğin daha uygun hale getirecektir.	2026-03-16 08:39:20.09
13	2	SKILL	Belirtilmemi┼ş	JavaScript (Node.js, Express.js tecr├╝besiyle), Python, C#, SQL	t	─░┼ş ilan─▒nda Node.js ve Express.js tecr├╝besi g├╝├ğl├╝ bir ┼şekilde arand─▒─ş─▒ i├ğin, JavaScript'i ├Ân plana ├ğ─▒kararak parantez i├ğinde ilgili deneyimi belirtmek, aday─▒n becerilerini hedeflenen role g├Âre vurgulayacakt─▒r.	2026-03-16 08:39:20.09
14	2	SKILL	Belirtilmemi┼ş	Pandas, NumPy, Scikit-learn, Sequelize ORM (─░li┼şkisel veritaban─▒ ORM tecr├╝besi, NoSQL veritabanlar─▒na h─▒zl─▒ adaptasyon yetene─şi)	t	─░┼ş ilan─▒nda MongoDB gibi NoSQL veritabanlar─▒ beklendi─şi i├ğin, Sequelize ORM tecr├╝besini genel bir ORM bilgisi olarak sunup NoSQL teknolojilerine adaptasyon yetene─şini belirtmek, aday─▒n esnekli─şini ve ├Â─şrenme a├ğ─▒kl─▒─ş─▒n─▒ g├Âsterecektir.	2026-03-16 08:39:20.09
15	2	SKILL	Belirtilmemi┼ş	Makine ├û─şrenimi, Derin ├û─şrenme, Veri Madencili─şi, Do─şal Dil ─░┼şleme, Zaman Serisi Analizi, Tahminsel Modelleme (Karma┼ş─▒k algoritmik problemler ├ğ├Âzme ve veri odakl─▒ kararlar alma yetene─şi)	t	Aday─▒n Data Science & AI alan─▒ndaki g├╝├ğl├╝ becerileri, bu rol i├ğin do─şrudan temel olmasa da, karma┼ş─▒k problemleri ├ğ├Âzme ve algoritmik d├╝┼ş├╝nme yetene─şini g├Âsterir. Bu becerileri daha genel bir 'problem ├ğ├Âzme' yetene─şi olarak vurgulamak, aday─▒n analitik kapasitesini Full Stack rol├╝ne uygun hale getirecektir.	2026-03-16 08:39:20.09
16	2	SKILL	Belirtilmemi┼ş	HTML5, CSS3, JavaScript, EJS, Bootstrap 5, Responsive Design, ReactJS (temel d├╝zeyde), Haz─▒r Y├Ânetim Paneli ┼Şablonlar─▒ (Shadcn benzeri)	t	─░┼ş ilan─▒nda ReactJS ve haz─▒r y├Ânetim paneli ┼şablonlar─▒ (Shadcn gibi) bilgisi beklendi─şi i├ğin, aday─▒n bu alanlardaki mevcut veya geli┼ştirilmeye a├ğ─▒k yetkinli─şini a├ğ─▒k├ğa belirtmek ├Ânemlidir.	2026-03-16 08:39:20.09
17	2	SKILL	Belirtilmemi┼ş	MySQL, ─░li┼şkisel Veritaban─▒ Tasar─▒m─▒, Sequelize ORM (MongoDB, Redis, Elasticsearch gibi NoSQL ve mesaj kuyruk sistemlerine adaptasyon yetene─şi)	t	─░┼ş ilan─▒nda MongoDB, Redis ve Elasticsearch gibi spesifik veritaban─▒ ve cache teknolojileri beklendi─şinden, mevcut veritaban─▒ bilgisini bu teknolojilere adaptasyon yetene─şi ile birlikte sunmak aday─▒ ├Âne ├ğ─▒karacakt─▒r.	2026-03-16 08:39:20.09
18	2	PROJECT	U├ğu┼ş Gecikmesi Tahmini: Topluluk ML ve Zaman Serisi Tahmini (Python, Flask ile Web Da─ş─▒t─▒m─▒)	Geni┼ş ├ûl├ğekli Veri Boru Hatt─▒: Havac─▒l─▒k operasyonlar─▒ ├╝zerindeki hava durumu etkisini analiz etmek i├ğin 454.000'den fazla u├ğu┼ş kayd─▒n─▒ ger├ğek zamanl─▒ meteorolojik verilerle (Meteostat API kullanarak) entegre ettim.\nY├╝ksek Do─şruluklu Regresyon Modelleri: Ensemble modeller (XGBoost, Random Forest, LightGBM) geli┼ştirdim ve k─▒yaslad─▒m. RandomizedSearchCV ile RMSE ve MAE'yi optimize ederek XGBoost ile %91.9 R┬▓ skoru elde ettim.\nSon Teknoloji Zaman Serisi Modellemesi: Karma┼ş─▒k zamansal ba─ş─▒ml─▒l─▒klar─▒ ve mevsimselli─şi yakalamak i├ğin TimesFM, TimeLLM (GPT-2 tabanl─▒) ve Temporal Fusion Transformers (TFT) dahil olmak ├╝zere geli┼şmi┼ş Derin ├û─şrenme mimarilerini uygulad─▒m.\n├ûzellik M├╝hendisli─şi: Modelin sa─şlaml─▒─ş─▒n─▒ art─▒rmak i├ğin IQR ayk─▒r─▒ de─şer tespiti, gecikme ├Âzellikleri, hareketli ortalamalar ve d├Âng├╝sel tarih kodlamas─▒ gibi geli┼şmi┼ş ├Ân i┼şleme teknikleri uygulad─▒m.\nWeb Da─ş─▒t─▒m─▒ ve ├£retim Ortam─▒ Yetene─şi: Tahmin motorunu Flask kullanarak kullan─▒c─▒ dostu bir web uygulamas─▒ olarak da─ş─▒tt─▒m, dinamik, dakikaya dayal─▒ gecikme tahminleri sa─şlad─▒m. Bu deneyim, canl─▒ bir sistemi y├Ânetme ve da─ş─▒tma yetkinli─şimi g├Âstermektedir.	t	Bu projenin b├╝y├╝k ├Âl├ğ├╝de Veri Bilimi odakl─▒ olmas─▒na ra─şmen, 'Web Da─ş─▒t─▒m─▒' k─▒sm─▒ aday─▒n sistem da─ş─▒t─▒m─▒ ve potansiyel ├╝retim ortam─▒ y├Ânetimi yeteneklerini g├Âsterir. Bu k─▒sm─▒ daha fazla vurgulamak, i┼ş ilan─▒ndaki 'Server konfig├╝rasyonu, deployment s├╝re├ğleri' gibi beklentilerle uyum sa─şlayacakt─▒r. Ba┼şl─▒kta Flask ile Web Da─ş─▒t─▒m─▒ eklemek de bu vurguyu art─▒r─▒r.	2026-03-16 08:39:20.09
19	2	PROJECT	Belirtilmemi┼ş	U├ğtan Uca Mimari: Node.js ve Express kullanarak kapsaml─▒, ├Âl├ğeklenebilir ve mod├╝ler bir MVC yap─▒s─▒na sahip ├û─şrenim Y├Ânetim Sistemi (LMS) geli┼ştirdim. Bu proje, temiz, okunabilir ve s├╝rd├╝r├╝lebilir kod yazma prensiplerini yans─▒tmaktad─▒r.\nG├╝venlik ve ─░┼ş Mant─▒─ş─▒: Rol Tabanl─▒ Eri┼şim Kontrol├╝ (RBAC) gibi sa─şlam g├╝venlik ├Âzelliklerini tasarlad─▒m ve ├ğak─▒┼şmas─▒z randevu planlama algoritmas─▒ olu┼şturdum. Bu, sistem g├╝venli─şi ve karma┼ş─▒k i┼ş mant─▒─ş─▒ geli┼ştirmedeki yetkinli─şimi g├Âstermektedir.\nVeritaban─▒ Y├Ânetimi ve API Entegrasyonu: MySQL ve Sequelize ORM kullanarak kaynak payla┼ş─▒m─▒, ├Âdev teslimleri ve kullan─▒c─▒ verilerini verimli bir ┼şekilde y├Ânetmek i├ğin karma┼ş─▒k ili┼şkisel ┼şemalar olu┼şturdum. Mevcut frontend mimarisine uygun API entegrasyonlar─▒n─▒ ba┼şar─▒yla ger├ğekle┼ştirdim.	t	Bu proje, aday─▒n Full Stack geli┼ştirme yeteneklerini en iyi yans─▒tan projedir. ─░┼ş ilan─▒ndaki Node.js, Express, veritaban─▒ y├Ânetimi, ├Âl├ğeklenebilirlik (MVC ile vurguland─▒), g├╝venlik, API entegrasyonu ve temiz kod gibi anahtar kelimelerle daha g├╝├ğl├╝ bir uyum sa─şlamas─▒ i├ğin a├ğ─▒klamalar─▒n yeniden d├╝zenlenmesi gerekmektedir. ├ûzellikle 'API entegrasyonu' ve 'temiz kod' ifadelerinin eklenmesi do─şrudan ilandaki beklentilerle e┼şle┼şir.	2026-03-16 08:39:20.09
20	3	EXPERIENCE	Belirtilmemi┼ş	End-to-End ML Development: Practicus AI platformunu kullanarak ham veri al─▒m─▒ndan model e─şitimine ve *├╝retim sistemlerine entegrasyona* kadar tam veri bilimi ya┼şam d├Âng├╝s├╝n├╝ y├Ânettim. Data Preprocessing: Makine ├Â─şrenimi g├Ârevleri i├ğin y├╝ksek kaliteli veri setleri haz─▒rlamak amac─▒yla titiz veri temizleme, eksik de─şer analizi ve ayk─▒r─▒ de─şer tespiti yapt─▒m. Model Training & Evaluation: ─░┼şlenmi┼ş veri setleri ├╝zerinde denetimli ├Â─şrenme modellerini e─şittim ve *performans, ├Âl├ğeklenebilirlik ve g├╝venilirli─şi optimize etmek* i├ğin analiz ettim. *Data Pipelines & API Integration: Karma┼ş─▒k veri setlerini analiz etmek ve ML modellerini entegre etmek i├ğin veri i┼şlem hatlar─▒ olu┼şturdum ve API entegrasyonlar─▒ ger├ğekle┼ştirdim*. Technical Stack: Veri manip├╝lasyonu, istatistiksel analiz ve ├Âzellik m├╝hendisli─şi i├ğin Python (Pandas, Scikit-learn) ve SQL kulland─▒m. *Uzak (Remote) bir ortamda ba┼şar─▒l─▒ bir ┼şekilde ├ğal─▒┼şt─▒m.*	t	Staj deneyiminde 'u├ğtan uca ML geli┼ştirme' ifadesi, i┼ş ilan─▒ndaki 'modelleri tasarlama, geli┼ştirme ve da─ş─▒tma' sorumluluklar─▒yla do─şrudan ili┼şkilendirilmelidir. Veri ├Ân i┼şleme ve model e─şitimi s├╝re├ğlerine ek olarak, modellerin ├╝retim ortamlar─▒na entegrasyonu, performans, ├Âl├ğeklenebilirlik ve g├╝venilirli─şi optimize etme gibi pratik uygulamalar vurgulanmal─▒d─▒r. Ayr─▒ca, 'data pipelines' ve 'API integration' anahtar kelimelerinin eklenmesi ve uzaktan ├ğal─▒┼şma deneyiminin belirtilmesi aday─▒n profilini g├╝├ğlendirecektir.	2026-03-16 12:22:40.097
21	3	SKILL	Belirtilmemi┼ş	Python, C#, JavaScript, SQL, *Version Control Systems (Git)*	t	─░┼ş ilan─▒nda a├ğ─▒k├ğa belirtilen 'versiyon kontrol sistemleri' yetene─şinin CV'de do─şrudan yer almas─▒, aday─▒n bu kritere uygunlu─şunu g├Âsterecektir. Bu beceri, genel programlama becerileri aras─▒na eklenebilir.	2026-03-16 12:22:40.097
22	3	SKILL	Belirtilmemi┼ş	Node.js, Express.js, *JSON Data Structures, RESTful API Development*	t	─░┼ş ilan─▒ndaki 'JSON veri yap─▒lar─▒' ve 'API geli┼ştirme' gereksinimlerini do─şrudan kar┼ş─▒lamak i├ğin Backend Development b├Âl├╝m├╝ne bu anahtar kelimeler eklenmelidir. Node.js ve Express.js ile ├ğal─▒┼şmak genellikle RESTful API'ler ve JSON ile ├ğal─▒┼şmay─▒ i├ğerir, bu nedenle bu eklemeler deneyimi daha net ifade edecektir.	2026-03-16 12:22:40.097
23	3	PROJECT	Belirtilmemi┼ş	Large-Scale Data Pipeline: 454.000'den fazla u├ğu┼ş kayd─▒n─▒ ger├ğek zamanl─▒ meteorolojik verilerle (Meteostat API kullanarak) entegre ederek havac─▒l─▒k operasyonlar─▒ ├╝zerindeki hava etkisi analizini ger├ğekle┼ştirdim, *b├Âylece sa─şlam veri i┼şleme ve API entegrasyonu yeteneklerimi sergiledim.* High-Accuracy Regression Models: Ensemble modelleri (XGBoost, Random Forest, LightGBM) geli┼ştirip k─▒yaslad─▒m. XGBoost ile %91.9 R┬▓ skoru elde ettim ve RMSE ile MAE'yi RandomizedSearchCV arac─▒l─▒─ş─▒yla optimize ettim, *modellerin performans─▒n─▒ ve g├╝venilirli─şini vurgulad─▒m.* State-of-the-Art Time Series Modeling: TimesFM, TimeLLM (GPT-2 tabanl─▒) ve Temporal Fusion Transformers (TFT) gibi geli┼şmi┼ş Derin ├û─şrenme mimarilerini uygulayarak karma┼ş─▒k zamansal ba─ş─▒ml─▒l─▒klar─▒ ve mevsimselli─şi yakalad─▒m. Feature Engineering: Modelin sa─şlaml─▒─ş─▒n─▒ art─▒rmak i├ğin IQR ayk─▒r─▒ de─şer tespiti, gecikmeli ├Âzellikler, yuvarlanan ortalamalar ve d├Âng├╝sel tarih kodlamas─▒ gibi geli┼şmi┼ş ├Ân i┼şleme teknikleri uygulad─▒m. Web Deployment: Tahmin motorunu Flask kullanarak kullan─▒c─▒ dostu bir web uygulamas─▒ olarak *├╝retim ortam─▒na da─ş─▒tt─▒m*, dinamik, dakika bazl─▒ gecikme tahminleri sa─şlayarak *uygulamal─▒ AI m├╝hendisli─şi becerilerimi g├Âsterdim*.	t	Projenin 'veri i┼şlem hatt─▒' ve 'API entegrasyonu' y├Ânleri ile 'web da─ş─▒t─▒m─▒' (deployment) k─▒s─▒mlar─▒, i┼ş ilan─▒ndaki 'API'ler ve veri hatlar─▒ geli┼ştirme' ve 'modelleri ├╝retim sistemlerine entegre etme' beklentileriyle daha g├╝├ğl├╝ bir ┼şekilde e┼şle┼ştirilmelidir. 'Model optimizasyonu' ve 'performans/g├╝venilirlik' ifadeleri de eklenmelidir.	2026-03-16 12:22:40.097
24	3	PROJECT	Belirtilmemi┼ş	End-to-End NLP Pipeline: Transfer ├û─şrenimi tekniklerini kullanarak T├╝rk├ğe ┼şark─▒ s├Âzleri i├ğin ├Âzel olarak ├ğok s─▒n─▒fl─▒ bir duygu s─▒n─▒fland─▒rma sistemi olu┼şturdum. Automated Data Engineering: Ham web kaz─▒nm─▒┼ş verileri otomatik olarak etiketlemek i├ğin Zero-Shot ├û─şrenmeyi (Pseudo-Labeling) uygulad─▒m ve manuel etiketleme olmadan y├╝ksek kaliteli bir e─şitim veri seti olu┼şturdum. Model Deployment: ├ûnceden e─şitilmi┼ş bir BERT mimarisini T├╝rk├ğe dilindeki anlamsal incelikleri yakalamak i├ğin ince ayar yapt─▒m ve modeli Flask kullanarak *ger├ğek zamanl─▒ bir RESTful API olarak ba┼şar─▒yla da─ş─▒tt─▒m*, *API geli┼ştirme ve ML modellerini ├╝retim sistemlerine entegrasyon konusundaki uzmanl─▒─ş─▒m─▒ kan─▒tlad─▒m*.	t	Bu projedeki 'ger├ğek zamanl─▒ RESTful API olarak da─ş─▒t─▒m' k─▒sm─▒, i┼ş ilan─▒ndaki 'API geli┼ştirme' ve 'makine ├Â─şrenimi modellerini ├╝retim sistemlerine entegre etme' beklentileriyle daha g├╝├ğl├╝ bir ┼şekilde ili┼şkilendirilmelidir.	2026-03-16 12:22:40.097
25	3	PROJECT	Belirtilmemi┼ş	Hybrid Detection Engine: Derin ├û─şrenmeyi (XLM-RoBERTa) kural tabanl─▒ ├Âzellik ├ğ─▒karma (URL analizi, IP kullan─▒m─▒ ve ┼ş├╝pheli desenler) ile birle┼ştiren bir kimlik av─▒ tespit sistemi geli┼ştirdim. Advanced Classification: Modelin hem ikili s─▒n─▒fland─▒rma (G├╝venli vs. Kimlik Av─▒) hem de k├Ât├╝ ama├ğl─▒ i├ğerik i├ğin ince taneli kategori tahmini yapmas─▒n─▒ tasarlad─▒m. Interactive Interface: Kullan─▒c─▒lara tespit edilen g├╝venlik tehditleri i├ğin insan taraf─▒ndan okunabilir a├ğ─▒klamalar sa─şlamak ├╝zere iste─şe ba─şl─▒ bir Mistral LLM ile entegre, etkile┼şimli bir web aray├╝z├╝ uygulad─▒m, *b├Âylece AI ├ğ├Âz├╝mlerini ger├ğek d├╝nya problemlerine uygulamadaki ve da─ş─▒t─▒mdaki yetene─şimi g├Âsterdim ve ├Âl├ğeklenebilirli─şi g├Âz ├Ân├╝nde bulundurdum*.	t	Projenin 'etkile┼şimli web aray├╝z├╝' arac─▒l─▒─ş─▒yla modelin kullan─▒m─▒n─▒ ve i┼şlevselli─şini vurgulamak, aday─▒n AI ├ğ├Âz├╝mlerini ger├ğek d├╝nya problemlerine uygulama ve da─ş─▒tma yetene─şini g├Âsterir. '├ûl├ğeklenebilirlik' gibi anahtar kelimelerin eklenmesi de faydal─▒ olacakt─▒r.	2026-03-16 12:22:40.097
40	9	EXPERIENCE	Belirtilmemi┼ş	End├╝striyel tesis projelerinde liderlik ederek, mekanik tasar─▒m, uygulama ve devreye alma s├╝re├ğlerinin zaman─▒nda ve b├╝t├ğe dahilinde tamamlanmas─▒n─▒ sa─şlama. ├£retim veya saha operasyonlar─▒n─▒n verimlili─şini art─▒rmak amac─▒yla detayl─▒ analizler yapma ve iyile┼ştirme projeleri y├╝r├╝tme. M├╝┼şteri ve di─şer disiplinlerle s├╝rekli koordinasyon i├ğinde, saha taleplerine uygun m├╝hendislik ├ğ├Âz├╝mleri geli┼ştirme.	t	Aday─▒n 'proje liderli─şi' deneyimini, i┼ş ilan─▒nda belirtilen 'saha koordinasyonu', 'i┼ş takibi' ve 'sonu├ğ odakl─▒l─▒k' anahtar kelimeleriyle ba─şlamak. '├£retim s├╝re├ğleri' yerine 'saha operasyonlar─▒' ifadesini kullanarak deneyimi ilana daha uygun hale getirmek.	2026-03-18 10:55:58.202
41	9	EXPERIENCE	Belirtilmemi┼ş	Kapsaml─▒ proje y├Ânetimi ve planlama s├╝re├ğlerini ba┼şar─▒yla y├╝r├╝tme, i┼ş programlar─▒na g├Âre saha aktivitelerinin koordinasyonunu sa─şlama. ├£retim veya kurulum hatlar─▒nda ortaya ├ğ─▒kan teknik sorunlara yerinde m├╝dahale ederek h─▒zl─▒ ve kal─▒c─▒ ├ğ├Âz├╝mler sunma, operasyonel destek sa─şlama. Yeni ├╝r├╝n ve sistemlerin tasar─▒m─▒, geli┼ştirilmesi ve sahada uygulanmas─▒ a┼şamalar─▒nda m├╝hendislik ├ğ├Âz├╝mleri sunma.	t	Aday─▒n 'proje y├Ânetimi' ve 'sorun giderme' tecr├╝besini, 'saha aktiviteleri' ve 'yerinde m├╝dahale' ifadeleriyle i┼ş ilan─▒ndaki '┼şantiye sevk ve idaresi' ve 'problem ├ğ├Âzme' yetkinlikleriyle do─şrudan ili┼şkilendirmek.	2026-03-18 10:55:58.202
42	9	SKILL	Belirtilmemi┼ş	CAD Yaz─▒l─▒mlar─▒: AutoCAD (Etkin d├╝zeyde kullan─▒m deneyimi)	t	─░┼ş ilan─▒nda 'AutoCAD programlar─▒n─▒ etkin d├╝zeyde kullanabilen' ifadesi ge├ğti─şi i├ğin, aday─▒n yetkinli─şini bu ifadeyle uyumlu hale getirerek ATS e┼şle┼şmesini art─▒rmak.	2026-03-18 10:55:58.202
43	9	SKILL	Belirtilmemi┼ş	Veri Analizi ve Ofis Yaz─▒l─▒mlar─▒: Microsoft Office (Excel, Word, PowerPoint) (─░leri)	t	─░┼ş ilan─▒nda genel 'MsOffice' becerisi talep edildi─şi i├ğin, aday─▒n Excel bilgisini MsOffice paketi olarak geni┼şletmek ve di─şer temel programlar─▒ da belirtmek, etkin kullan─▒m vurgusunu g├╝├ğlendirerek ATS e┼şle┼şmesini art─▒rmak.	2026-03-18 10:55:58.202
44	9	SKILL	Belirtilmemi┼ş	Proje Y├Ânetimi: Proje planlamas─▒, i┼ş takibi, koordinasyon ve sonu├ğ odakl─▒ y├Ânetim (─░leri)	t	─░┼ş ilan─▒nda ├Âzellikle belirtilen 'planlama', 'i┼ş takibi' ve 'koordinasyon' becerilerini do─şrudan aday─▒n 'Proje Y├Ânetimi' yetene─şinin tan─▒m─▒na ekleyerek ATS e┼şle┼şmesini art─▒rmak.	2026-03-18 10:55:58.202
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."Task" (id, title, "isCompleted", "userId") FROM stdin;
\.


--
-- Data for Name: UpgradeRequest; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."UpgradeRequest" (id, status, "adminNote", "createdAt", "updatedAt", "userId") FROM stdin;
1	APPROVED	\N	2026-03-05 07:44:04.549	2026-03-05 07:44:20.812	4
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: sude
--

COPY public."User" (id, email, password, name, username, age, address, role, "createdAt", "isEmailVerified", "emailVerificationToken", "resetPasswordToken", "resetPasswordExpires", "isPrivate") FROM stdin;
3	sudis.meydan@gmail.com	$2b$10$qjiUEQooGZnLtfU0ORmQROkZIe0shWwPoU.wvO844NDVrMdZVrLJu	Meydan	Sude	22	Ankara	SUPERADMIN	2026-03-04 13:04:39.332	t	\N	\N	\N	f
4	sude.meydan35@gmail.com	$2b$10$a0WBrnsNWADkKQnLD9GzuOGmT5JvMcZzPwo4ntNG7SVjeGXlqWal2	kullan─▒c─▒1	kullan─▒c─▒1	22	─░stanbul	PRO_USER	2026-03-05 07:43:38.158	t	\N	\N	\N	f
\.


--
-- Name: AtsFormattedCV_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."AtsFormattedCV_id_seq"', 1, true);


--
-- Name: Block_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."Block_id_seq"', 1, false);


--
-- Name: CVEntry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."CVEntry_id_seq"', 55, true);


--
-- Name: CV_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."CV_id_seq"', 21, true);


--
-- Name: Connection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."Connection_id_seq"', 1, true);


--
-- Name: JobPosting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."JobPosting_id_seq"', 8, true);


--
-- Name: PostImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."PostImage_id_seq"', 1, true);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."Post_id_seq"', 2, true);


--
-- Name: ProfileImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."ProfileImage_id_seq"', 1, false);


--
-- Name: Profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."Profile_id_seq"', 1, false);


--
-- Name: TailoredCVEntry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."TailoredCVEntry_id_seq"', 44, true);


--
-- Name: TailoredCV_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."TailoredCV_id_seq"', 9, true);


--
-- Name: Task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."Task_id_seq"', 1, false);


--
-- Name: UpgradeRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."UpgradeRequest_id_seq"', 1, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sude
--

SELECT pg_catalog.setval('public."User_id_seq"', 4, true);


--
-- Name: AtsFormattedCV AtsFormattedCV_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."AtsFormattedCV"
    ADD CONSTRAINT "AtsFormattedCV_pkey" PRIMARY KEY (id);


--
-- Name: Block Block_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "Block_pkey" PRIMARY KEY (id);


--
-- Name: CVEntry CVEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CVEntry"
    ADD CONSTRAINT "CVEntry_pkey" PRIMARY KEY (id);


--
-- Name: CV CV_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CV"
    ADD CONSTRAINT "CV_pkey" PRIMARY KEY (id);


--
-- Name: Connection Connection_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_pkey" PRIMARY KEY (id);


--
-- Name: JobPosting JobPosting_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."JobPosting"
    ADD CONSTRAINT "JobPosting_pkey" PRIMARY KEY (id);


--
-- Name: PostImage PostImage_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."PostImage"
    ADD CONSTRAINT "PostImage_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: ProfileImage ProfileImage_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."ProfileImage"
    ADD CONSTRAINT "ProfileImage_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: TailoredCVEntry TailoredCVEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCVEntry"
    ADD CONSTRAINT "TailoredCVEntry_pkey" PRIMARY KEY (id);


--
-- Name: TailoredCV TailoredCV_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCV"
    ADD CONSTRAINT "TailoredCV_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: UpgradeRequest UpgradeRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."UpgradeRequest"
    ADD CONSTRAINT "UpgradeRequest_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: AtsFormattedCV_cvId_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "AtsFormattedCV_cvId_key" ON public."AtsFormattedCV" USING btree ("cvId");


--
-- Name: Block_blockerId_blockedId_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON public."Block" USING btree ("blockerId", "blockedId");


--
-- Name: Connection_senderId_receiverId_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "Connection_senderId_receiverId_key" ON public."Connection" USING btree ("senderId", "receiverId");


--
-- Name: ProfileImage_userId_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "ProfileImage_userId_key" ON public."ProfileImage" USING btree ("userId");


--
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- Name: User_emailVerificationToken_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON public."User" USING btree ("emailVerificationToken");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_resetPasswordToken_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON public."User" USING btree ("resetPasswordToken");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: sude
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: AtsFormattedCV AtsFormattedCV_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."AtsFormattedCV"
    ADD CONSTRAINT "AtsFormattedCV_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public."CV"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Block Block_blockedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Block Block_blockerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Block"
    ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CVEntry CVEntry_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CVEntry"
    ADD CONSTRAINT "CVEntry_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public."CV"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CV CV_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."CV"
    ADD CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Connection Connection_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Connection Connection_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Connection"
    ADD CONSTRAINT "Connection_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PostImage PostImage_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."PostImage"
    ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProfileImage ProfileImage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."ProfileImage"
    ADD CONSTRAINT "ProfileImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TailoredCVEntry TailoredCVEntry_tailoredCvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCVEntry"
    ADD CONSTRAINT "TailoredCVEntry_tailoredCvId_fkey" FOREIGN KEY ("tailoredCvId") REFERENCES public."TailoredCV"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TailoredCV TailoredCV_jobPostingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCV"
    ADD CONSTRAINT "TailoredCV_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES public."JobPosting"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TailoredCV TailoredCV_originalCvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCV"
    ADD CONSTRAINT "TailoredCV_originalCvId_fkey" FOREIGN KEY ("originalCvId") REFERENCES public."CV"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TailoredCV TailoredCV_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."TailoredCV"
    ADD CONSTRAINT "TailoredCV_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UpgradeRequest UpgradeRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sude
--

ALTER TABLE ONLY public."UpgradeRequest"
    ADD CONSTRAINT "UpgradeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict sprhy3idK2VRk0ETq6hW299TFw6O7LihZCIraMdJLOVOO8kqfSIbSq3KpYMHVpk

