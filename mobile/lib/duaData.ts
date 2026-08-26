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
    title: "Knowledge & Family",
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
