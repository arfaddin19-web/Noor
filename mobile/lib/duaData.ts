export interface DuaEntry {
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
}

export interface DuaCategory {
  key: string;
  title: string;
  items: DuaEntry[];
}

// A curated set of the Six Kalimas (as commonly taught across South Asian
// madrasas, including Nepal) plus everyday duas, each with Arabic, a
// transliteration, an English translation, and a source reference where
// applicable. Kept local/offline — no network dependency, no fabricated text.
export const DUA_CATEGORIES: DuaCategory[] = [
  {
    key: "kalimas",
    title: "The Six Kalimas",
    items: [
      {
        title: "1st Kalima — Tayyibah",
        arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ",
        transliteration: "Lā ilāha illallāhu Muhammadur Rasūlullāh",
        translation:
          "There is none worthy of worship except Allah; Muhammad ﷺ is the messenger of Allah.",
      },
      {
        title: "2nd Kalima — Shahadat",
        arabic:
          "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration:
          "Ashhadu al-lā ilāha illallāhu wahdahu lā sharīka lahu wa ashhadu anna Muhammadan 'abduhu wa rasūluh",
        translation:
          "I bear witness that there is none worthy of worship except Allah, alone, without partner, and I bear witness that Muhammad ﷺ is His servant and messenger.",
      },
      {
        title: "3rd Kalima — Tamjeed",
        arabic:
          "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        transliteration:
          "Subhānallāhi walhamdu lillāhi wa lā ilāha illallāhu wallāhu akbar, wa lā hawla wa lā quwwata illā billāhil 'aliyyil 'azīm",
        translation:
          "Glory be to Allah, praise be to Allah, there is none worthy of worship except Allah, and Allah is the greatest; there is no power and no strength except with Allah, the Exalted, the Great.",
      },
      {
        title: "4th Kalima — Tawheed",
        arabic:
          "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا، ذُو الْجَلَالِ وَالْإِكْرَامِ، بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration:
          "Lā ilāha illallāhu wahdahu lā sharīka lah, lahul mulku wa lahul hamdu yuhyī wa yumītu wa huwa hayyul lā yamūtu abadan abadā, dhul jalāli wal ikrām, biyadihil khayru wa huwa 'alā kulli shay'in qadīr",
        translation:
          "There is none worthy of worship except Allah, alone, without partner. His is the kingdom and His is all praise. He gives life and causes death, and He is ever-living, never dying. Possessor of majesty and honor — in His hand is all good, and He has power over all things.",
      },
      {
        title: "5th Kalima — Astaghfar",
        arabic:
          "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمْدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
        transliteration:
          "Astaghfirullāha rabbī min kulli dhambin adhnabtuhu 'amadan aw khata'an sirran aw 'alāniyatan wa atūbu ilayhi minadh dhanbil-ladhī a'lamu wa minadh dhanbil-ladhī lā a'lam. Innaka anta 'allāmul ghuyūbi wa sattārul 'uyūbi wa ghaffārudh dhunūbi wa lā hawla wa lā quwwata illā billāhil 'aliyyil 'azīm",
        translation:
          "I seek forgiveness from Allah, my Lord, for every sin I committed knowingly or unknowingly, secretly or openly, and I turn to Him in repentance from the sin I know and the sin I do not know. Indeed You are the Knower of the unseen, the Concealer of faults, the Forgiver of sins; there is no power and no strength except with Allah, the Exalted, the Great.",
      },
      {
        title: "6th Kalima — Radd-e-Kufr",
        arabic:
          "اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيبَةِ وَالْبِدْعَةِ وَالنَّمِيمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَأَقُولُ لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ",
        transliteration:
          "Allāhumma innī a'ūdhu bika min an ushrika bika shay'an wa ana a'lamu bihī wa astaghfiruka limā lā a'lamu bihī, tubtu 'anhu wa tabarra'tu minal kufri wash shirki wal kadhibi wal ghībati wal bid'ati wan namīmati wal fawāhishi wal buhtāni wal ma'āsī kullihā wa aslamtu wa aqūlu lā ilāha illallāhu Muhammadur Rasūlullāh",
        translation:
          "O Allah, I seek refuge in You from associating any partner with You knowingly, and I seek Your forgiveness for what I do not know. I repent from it and disown disbelief, polytheism, lying, backbiting, innovation, tale-carrying, immorality, slander, and all sins, and I submit, saying: there is none worthy of worship except Allah; Muhammad ﷺ is the messenger of Allah.",
      },
    ],
  },
  {
    key: "daily",
    title: "Daily Life",
    items: [
      {
        title: "Before eating",
        arabic: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah",
        translation: "In the name of Allah.",
        reference: "Abu Dawud",
      },
      {
        title: "After eating",
        arabic:
          "اَلْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration:
          "Alhamdu lillāhil-ladhī at'amanī hādhā wa razaqanīhi min ghayri hawlin minnī wa lā quwwah",
        translation:
          "All praise is for Allah who fed me this and provided it for me without any might or power on my part.",
        reference: "Abu Dawud, Tirmidhi",
      },
      {
        title: "Before sleeping",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allāhumma amūtu wa ahyā",
        translation: "In Your name, O Allah, I die and I live.",
        reference: "Bukhari",
      },
      {
        title: "Upon waking up",
        arabic:
          "اَلْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration:
          "Alhamdu lillāhil-ladhī ahyānā ba'da mā amātanā wa ilayhin-nushūr",
        translation:
          "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
        reference: "Bukhari",
      },
      {
        title: "Entering the home",
        arabic:
          "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
        transliteration:
          "Bismillāhi walajnā wa bismillāhi kharajnā wa 'alallāhi rabbinā tawakkalnā",
        translation:
          "In the name of Allah we enter, and in the name of Allah we leave, and upon Allah, our Lord, we place our trust.",
        reference: "Abu Dawud",
      },
      {
        title: "Leaving the home",
        arabic:
          "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration:
          "Bismillāhi tawakkaltu 'alallāhi wa lā hawla wa lā quwwata illā billāh",
        translation:
          "In the name of Allah, I place my trust in Allah; there is no power and no strength except with Allah.",
        reference: "Abu Dawud, Tirmidhi",
      },
      {
        title: "Entering the masjid",
        arabic: "اَللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allāhumma-ftah lī abwāba rahmatik",
        translation: "O Allah, open the doors of Your mercy for me.",
        reference: "Muslim",
      },
      {
        title: "Leaving the masjid",
        arabic: "اَللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        transliteration: "Allāhumma innī as'aluka min fadlik",
        translation: "O Allah, I ask You from Your bounty.",
        reference: "Muslim",
      },
      {
        title: "Before wudu (ablution)",
        arabic: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah",
        translation: "In the name of Allah.",
        reference: "Abu Dawud, Tirmidhi",
      },
      {
        title: "After wudu (ablution)",
        arabic:
          "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اَللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
        transliteration:
          "Ashhadu al-lā ilāha illallāhu wahdahu lā sharīka lah, wa ashhadu anna Muhammadan 'abduhu wa rasūluh, Allāhummaj'alnī minat-tawwābīna waj'alnī minal-mutatahhirīn",
        translation:
          "I bear witness that there is none worthy of worship except Allah, alone, without partner, and I bear witness that Muhammad ﷺ is His servant and messenger. O Allah, make me among those who repent often and among those who purify themselves.",
        reference: "Muslim",
      },
    ],
  },
  {
    key: "salah",
    title: "Salah & Repentance",
    items: [
      {
        title: "After the Adhan (call to prayer)",
        arabic:
          "اَللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
        transliteration:
          "Allāhumma rabba hādhihid-da'watit-tāmmah, was-salātil-qā'imah, āti Muhammadanil-wasīlata wal-fadīlah, wab'ath-hu maqāman mahmūdanil-ladhī wa'adtah",
        translation:
          "O Allah, Lord of this perfect call and the established prayer, grant Muhammad ﷺ the intercession and favor, and raise him to the praiseworthy station You promised him.",
        reference: "Bukhari",
      },
      {
        title: "Sayyidul Istighfar — the master supplication for forgiveness",
        arabic:
          "اَللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration:
          "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastata'tu, a'ūdhu bika min sharri mā sana'tu, abū'u laka bini'matika 'alayya, wa abū'u bidhambī faghfir lī fa innahu lā yaghfirudh-dhunūba illā ant",
        translation:
          "O Allah, You are my Lord, there is none worthy of worship except You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me — for none forgives sins except You.",
        reference: "Bukhari",
      },
    ],
  },
  {
    key: "health",
    title: "Health & Distress",
    items: [
      {
        title: "For someone who is sick",
        arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
        transliteration: "As'alullāhal-'Azīma rabbal-'arshil-'azīmi an yashfiyak",
        translation: "I ask Allah the Mighty, Lord of the Mighty Throne, to cure you.",
        reference: "Abu Dawud, Tirmidhi",
      },
      {
        title: "When it rains",
        arabic: "اَللَّهُمَّ صَيِّبًا نَافِعًا",
        transliteration: "Allāhumma sayyiban nāfi'ā",
        translation: "O Allah, (bring) beneficial rain clouds.",
        reference: "Bukhari",
      },
      {
        title: "When sneezing / hearing someone sneeze",
        arabic: "اَلْحَمْدُ لِلَّهِ ۝ يَرْحَمُكَ اللَّهُ ۝ يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
        transliteration:
          "(Sneezer) Alhamdulillah — (others) Yarhamukallah — (sneezer replies) Yahdīkumullāhu wa yuslihu bālakum",
        translation:
          "The sneezer says \"Praise be to Allah\"; others reply \"May Allah have mercy on you\"; the sneezer then replies \"May Allah guide you and set your affairs right.\"",
        reference: "Bukhari",
      },
    ],
  },
  {
    key: "ramadan",
    title: "Ramadan & Fasting",
    items: [
      {
        title: "Breaking the fast (iftar)",
        arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
        transliteration: "Dhahaba adh-dhama'u wabtallatil-'urūqu wa thabatal-ajru in shā' Allāh",
        translation:
          "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
        reference: "Abu Dawud",
      },
      {
        title: "Seeking Laylatul Qadr",
        arabic: "اَللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        transliteration: "Allāhumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'annī",
        translation: "O Allah, You are Forgiving and love forgiveness, so forgive me.",
        reference: "Tirmidhi (Aisha)",
      },
    ],
  },
  {
    key: "protection",
    title: "Travel & Protection",
    items: [
      {
        title: "Setting out on a journey",
        arabic:
          "اَللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ. سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        transliteration:
          "Allāhu akbar, Allāhu akbar, Allāhu akbar. Subhānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn",
        translation:
          "Allah is the greatest (×3). Glory be to the One who has subjected this to us, for we could never have done it ourselves; and indeed, to our Lord we will return.",
        reference: "Qur'an 43:13–14; Muslim",
      },
      {
        title: "In distress or difficulty",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallāhu wa ni'mal wakīl",
        translation: "Allah is sufficient for us, and He is the best disposer of affairs.",
        reference: "Qur'an 3:173",
      },
      {
        title: "Entering the bathroom",
        arabic: "اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        transliteration: "Allāhumma innī a'ūdhu bika minal khubuthi wal khabā'ith",
        translation:
          "O Allah, I seek refuge in You from male and female devils, and from all evil and impurity.",
        reference: "Bukhari, Muslim",
      },
      {
        title: "Leaving the bathroom",
        arabic: "غُفْرَانَكَ",
        transliteration: "Ghufrānak",
        translation: "I seek Your forgiveness.",
        reference: "Abu Dawud, Tirmidhi",
      },
    ],
  },
  {
    key: "knowledge",
    title: "Knowledge, Guidance & Family",
    items: [
      {
        title: "Seeking knowledge",
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        transliteration: "Rabbi zidnī 'ilmā",
        translation: "My Lord, increase me in knowledge.",
        reference: "Qur'an 20:114",
      },
      {
        title: "For parents",
        arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        transliteration: "Rabbir-hamhumā kamā rabbayānī saghīrā",
        translation: "My Lord, have mercy upon them as they raised me when I was small.",
        reference: "Qur'an 17:24",
      },
      {
        title: "Istikhara — seeking guidance for a decision",
        arabic:
          "اَللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اَللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
        transliteration:
          "Allāhumma innī astakhīruka bi'ilmika, wa astaqdiruka biqudratika, wa as'aluka min fadlikal-'azīm, fa innaka taqdiru wa lā aqdir, wa ta'lamu wa lā a'lam, wa anta 'allāmul-ghuyūb. Allāhumma in kunta ta'lamu anna hādhal-amra khayrun lī fī dīnī wa ma'āshī wa 'āqibati amrī faqdurhu lī wa yassirhu lī thumma bārik lī fīh, wa in kunta ta'lamu anna hādhal-amra sharrun lī fī dīnī wa ma'āshī wa 'āqibati amrī fasrifhu 'annī wasrifnī 'anhu waqdur liyal-khayra haythu kāna thumma ardinī bih",
        translation:
          "O Allah, I seek Your guidance by Your knowledge, and I seek ability by Your power, and I ask You of Your great bounty. You have power and I have none, and You know and I do not, and You are the Knower of the unseen. O Allah, if You know this matter to be good for me in my religion, my livelihood, and the outcome of my affairs, then decree it for me, make it easy for me, and bless it for me. And if You know this matter to be bad for me in my religion, my livelihood, and the outcome of my affairs, then turn it away from me and turn me away from it, and decree for me what is good wherever it may be, and make me content with it.",
        reference: "Bukhari",
      },
    ],
  },
  {
    key: "comprehensive",
    title: "Comprehensive",
    items: [
      {
        title: "Good in this world and the next",
        arabic:
          "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration:
          "Rabbanā ātinā fid-dunyā hasanatan wa fil-ākhirati hasanatan wa qinā 'adhāban-nār",
        translation:
          "Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.",
        reference: "Qur'an 2:201",
      },
    ],
  },
];
