/* 기본으로 깔려 있는 카드들.
   여기를 고치면 앱을 처음 켤 때 들어가는 카드가 바뀝니다.
   이미 쓰고 있는 폰에는, 여기 새로 추가된 카드만 다음 실행 때 얹힙니다.

   한 줄 형식:  [상황, 영어, 한국어, 알아둘 점, 영어 예문, 한국어 예문, (선택) 메모]  */

export const SITUATIONS = [
  "현관","주방","식탁","거실","화장실","침실","옷·놀이방","차 안",
  "달래기","칭찬","훈육","기타"
];

// 예전 버전에 들어 있다가 빠진 기본 카드. 다음 실행 때 자동으로 걷어냅니다.
export const SEED_RETIRED = ["s49","s50","s51","s52","s53","s54","s55","s56"];

// 기본 카드를 늘리거나 고칠 때마다 이 숫자를 올리세요.
export const SEED_VERSION = 3;

export const SEED_ROWS = [

  /* ── 현관 ───────────────────────────────────────────── */
  ["현관","Let's put your shoes on. / Let's take them off.","신발 신자. / 벗자.",
   "영어는 입고 벗는 걸 동사가 아니라 on / off 로 가릅니다. 신발·양말·모자·외투가 전부 put ~ on / take ~ off 로 통일되니 틀 하나만 익히면 다 풀립니다. 급할 땐 'Shoes on!' 'Shoes off!' 두 마디로도 충분히 통합니다.",
   "Shoes on — we're going outside!","신발 신자, 밖에 나갈 거야!"],
  ["현관","Let's grab your bag.","가방 챙겨.",
   "grab 은 '움켜쥐다'가 아니라 일상에서 '가볍게 챙기다'입니다. take 보다 캐주얼하고 서두르는 느낌이 살짝 들어갑니다. 천천히 챙길 땐 'Let's get your bag.'",
   "Grab your bag — we're leaving in a minute.","가방 챙겨, 이제 곧 나갈 거야."],
  ["현관","Wait for me.","아빠 기다려.",
   "한국어는 자기를 '아빠'라고 3인칭으로 부르지만 영어는 그렇게 하지 않습니다. 'Wait for Daddy' 는 아빠 얘기를 옆에서 전해 주는 사람의 말투로 들려서, 본인이 말할 땐 'Wait for me.' 가 자연스럽습니다.",
   "Wait for me at the door, please.","문 앞에서 아빠 기다려."],
  ["현관","Let's head out.","이제 나가자.",
   "head out 은 '출발하다'에 가까워, 놀러 나간다는 뜻이 강한 go out 보다 목적지가 있는 외출에 맞습니다. 문을 나서는 바로 그 순간엔 'Let's go!' 가 제일 흔합니다.",
   "Everyone ready? Let's head out.","다 준비됐지? 이제 나가자."],
  ["현관","We're back!","우리 왔다!",
   "집에 돌아왔을 때 쓰는 정해진 인사입니다. 한국어 '다녀왔습니다' 같은 격식 표현은 영어에 없고, 'We're home!' 도 똑같이 씁니다.",
   "We're back! Shoes off, please.","우리 왔다! 신발 벗자."],
  ["현관","Say bye to Mommy.","엄마한테 인사해.",
   "인사를 시킬 때는 say + 인사말 구조를 씁니다. say hi, say thank you, say sorry 가 전부 같은 틀이라 이거 하나로 여러 상황이 풀립니다. 손까지 흔들게 하려면 'Wave bye-bye!'",
   "Say bye to Mommy — we'll see her tonight.","엄마한테 인사해, 저녁에 볼 거야."],

  /* ── 주방 ───────────────────────────────────────────── */
  ["주방","Dinner's ready!","저녁 다 됐어!",
   "ready 는 음식이 '먹을 수 있는 상태가 됐다'는 뜻입니다. 아침·점심도 그대로 Breakfast's ready / Lunch's ready. 상까지 다 차렸으면 'Dinner's on the table!'",
   "Dinner's ready — come sit down.","저녁 다 됐어, 와서 앉아."],
  ["주방","Wash your hands first.","손 먼저 씻자.",
   "영어는 손을 씻을 때 your 를 꼭 붙입니다. wash hands 라고만 하면 어색하게 들립니다. 비누까지 시키려면 'Use soap.' 한 마디를 덧붙이면 됩니다.",
   "Wash your hands first — with soap!","손 먼저 씻자, 비누로!"],
  ["주방","Bring your plate to the sink.","접시 싱크대에 갖다 놔.",
   "bring 은 말하는 사람 쪽으로, take 는 반대쪽으로 옮기는 것입니다. 부모가 싱크대 옆에 서 있으면 bring, 멀리 있으면 'Take your plate to the sink.' 가 맞습니다.",
   "All done? Bring your plate to the sink.","다 먹었어? 접시 싱크대에 갖다 놔."],
  ["주방","Help me set the table.","상 차리는 거 도와줘.",
   "set the table 은 수저와 그릇을 놓는 일 전체를 가리키는 굳은 표현입니다. 반대로 치우는 건 clear the table. 세 살에게는 'Can you put the spoons out?' 처럼 할 일을 하나만 집어 주면 훨씬 잘 움직입니다.",
   "Help me set the table — you do the spoons.","상 차리는 거 도와줘, 숟가락은 네가 놓고."],
  ["주방","Smells good!","맛있는 냄새 난다!",
   "냄새는 smells, 맛은 tastes, 겉모습은 looks 를 씁니다. 주어 없이 'Smells good!' 만 던지는 게 가장 자연스럽고, 'It smells delicious.' 는 조금 갖춘 말입니다.",
   "Mmm, smells good! What is Daddy making?","음, 맛있는 냄새 난다! 아빠 뭐 만들어?"],
  ["주방","It's almost done.","거의 다 됐어.",
   "요리에는 done, 사람이 일을 끝냈을 때는 finished 를 더 씁니다. 아이가 재촉할 때 쓰는 짝은 'Almost! Two more minutes.'",
   "It's almost done — two more minutes.","거의 다 됐어, 2분만."],

  /* ── 식탁 ───────────────────────────────────────────── */
  ["식탁","Take a bite.","한 입 먹어봐.",
   "bite 는 '한 입'이라는 셀 수 있는 단위입니다. 그래서 one more bite(한 입만 더), a big bite(크게 한 입)처럼 숫자와 붙습니다. 마시는 한 모금은 sip.",
   "Just take one bite and see.","딱 한 입만 먹어봐."],
  ["식탁","Blow on it, it's hot.","뜨거우니까 후 불어.",
   "음식에 입김을 부는 건 blow on it 으로 on 이 꼭 붙습니다. blow it 만 쓰면 '불어서 날려 버리다' 쪽으로 들립니다.",
   "Careful — blow on it, it's hot.","조심해, 뜨거우니까 후 불어."],
  ["식탁","Chew it well.","꼭꼭 씹어.",
   "한국어 '꼭꼭'처럼 소리를 겹쳐 다정함이나 강조를 만드는 방식이 영어엔 없어서 well 이나 slowly 로 대신합니다. 대신 'Chew, chew, chew!' 하고 반복하면 아이에게는 리듬이 생겨 잘 먹힙니다.",
   "Chew it well before you swallow.","삼키기 전에 꼭꼭 씹어."],
  ["식탁","All done?","다 먹었어?",
   "유아에게는 finished 보다 all done 이 훨씬 흔합니다. 식사뿐 아니라 놀이·목욕이 끝날 때도 그대로 쓰는 만능 표현이라, 영어권 아이들이 아주 일찍 배우는 말 중 하나입니다.",
   "All done? Let's wipe your hands.","다 먹었어? 손 닦자."],
  ["식탁","Wipe your mouth.","입 좀 닦자.",
   "마른 것으로 닦으면 wipe, 물로 씻으면 wash 입니다. 냅킨을 쥐여 주면서 'Use your napkin.' 이라고만 해도 같은 뜻이 됩니다.",
   "Wipe your mouth — you've got sauce on your chin.","입 좀 닦자, 턱에 소스 묻었어."],
  ["식탁","Sit in your chair.","네 의자에 앉아.",
   "등받이와 팔걸이가 몸을 감싸는 의자는 in, 벤치나 등받이 없는 자리는 on 을 씁니다. 유아용 의자는 대개 in your chair 입니다. 자세를 바로 하라는 말은 'Sit up.'",
   "Sit in your chair, please — not on your knees.","네 의자에 앉아, 무릎 세우지 말고."],

  /* ── 거실 ───────────────────────────────────────────── */
  ["거실","Come over here.","이리 와.",
   "come here 도 되지만 over 가 붙으면 '건너와'라는 거리감이 생겨서 방 저쪽에 있는 아이를 부를 때 딱 맞습니다. 급할 땐 'Come here, please.' 한 마디가 더 셉니다.",
   "Come over here — I want to show you something.","이리 와, 보여줄 게 있어."],
  ["거실","Come sit with me.","이리 와서 같이 앉자.",
   "영어는 동사 두 개를 to 없이 붙여 come sit, come play, go get 처럼 씁니다. 아이에게 쓰는 다정한 구어체이지 문법이 틀린 게 아닙니다.",
   "Come sit with me — we'll read one book.","이리 와서 같이 앉자, 책 한 권 읽고."],
  ["거실","Screen time's over.","이제 그만 볼 시간이야.",
   "screen time 은 영상·게임 보는 시간을 통째로 부르는 육아 용어입니다. 예고 없이 끄면 떼가 나기 마련이라, 'Five more minutes, then screen time's over.' 처럼 미리 알려 주는 게 영어권 부모들의 정석입니다.",
   "One more song, then screen time's over.","노래 하나만 더 보고, 그만 보는 거야."],
  ["거실","Let's clean up.","자, 이제 정리하자.",
   "clean up 은 어질러진 걸 치우는 일, tidy up 은 제자리에 가지런히 놓는 일에 가깝습니다. 영어권 어린이집에서는 'Clean up, clean up, everybody everywhere' 노래로 신호를 주는데, 그 노래 자체가 신호가 됩니다.",
   "Clean-up time! Blocks in the box.","정리 시간! 블록은 상자에."],
  ["거실","Quiet voice, please.","작은 목소리로.",
   "영어권 부모는 목소리를 크기별로 이름 붙여 가르칩니다. inside voice(집 안에서 내는 목소리) ↔ outside voice(밖에서 내는 목소리). 'Use your inside voice.' 가 가장 흔한 문장입니다.",
   "Quiet voice, please — the baby's sleeping.","작은 목소리로, 아기 자고 있어."],
  ["거실","Do you need to go?","화장실 가고 싶어?",
   "go 하나만으로 화장실 가는 걸 뜻하는 완곡한 표현입니다. 더 분명히 물으려면 'Do you need to go potty?' 이고, potty 는 유아에게만 씁니다.",
   "Do you need to go before we leave?","나가기 전에 화장실 갈래?"],

  /* ── 화장실 ─────────────────────────────────────────── */
  ["화장실","Pull your pants down. / Pull them up.","바지 내려. / 올려.",
   "옷을 위아래로 움직이는 건 pull down / pull up 입니다. put on / take off 는 완전히 입고 벗는 것이라 화장실에서는 pull 쪽이 맞습니다.",
   "Pull your pants down — I'll help with the button.","바지 내려, 단추는 아빠가 도와줄게."],
  ["화장실","Wipe front to back.","앞에서 뒤로 닦아.",
   "위생 때문에 방향까지 짚어 주는 고정 표현이라 통째로 외워 쓰면 됩니다. 대변은 'Wipe your bottom.' 이고, bottom 은 아이에게 쓰는 점잖은 말입니다.",
   "Wipe front to back — that's important.","앞에서 뒤로 닦아, 그게 중요해."],
  ["화장실","Flush it, please.","물 내려.",
   "변기 물을 내리는 동사는 flush 하나뿐입니다. 손잡이를 가리키며 'Push the handle.' 이라고 해도 되고, 손 씻기까지 'Flush and wash!' 로 묶어 주면 습관이 빨리 붙습니다.",
   "Flush it, please — then wash your hands.","물 내리고, 손 씻자."],
  ["화장실","Tilt your head back.","고개 뒤로 젖혀봐.",
   "머리 감길 때 쓰는 말입니다. tilt 는 각도를 조금 주는 느낌이고 완전히 눕히는 건 lean back. 세 살에게는 'Look up at the ceiling.' 이라고 하면 훨씬 쉽게 알아듣습니다.",
   "Tilt your head back so it doesn't get in your eyes.","고개 뒤로 젖혀봐, 눈에 안 들어가게."],
  ["화장실","Rinse it off.","씻어내자.",
   "비누나 거품을 물로 흘려보내는 건 rinse 이고, off 가 붙어야 '헹궈서 없앤다'가 됩니다. 입안을 헹구는 건 'Rinse and spit.'",
   "Close your eyes — let's rinse it off.","눈 감아, 씻어내자."],
  ["화장실","All clean!","다 깨끗해졌다!",
   "목욕이나 손 씻기가 끝났을 때 던지는 짧은 마무리 말입니다. all done 과 같은 틀이라 'All clean, all done!' 처럼 묶어 주면 아이가 끝났다는 걸 바로 압니다.",
   "All clean! Let's get you dry.","다 깨끗해졌다! 물기 닦자."],

  /* ── 침실 ───────────────────────────────────────────── */
  ["침실","Go pee before bed.","자기 전에 쉬하고 오자.",
   "go + 동사 원형(go pee, go wash, go get)은 아이에게 쓰는 구어체입니다. pee 는 유아어라 집에서 편하게 쓰이고, 점잖게는 'Go use the bathroom.'",
   "Go pee before bed, then we'll read.","자기 전에 쉬하고 오면 책 읽자."],
  ["침실","It's time for bed.","잘 시간이야.",
   "time for + 명사 / time to + 동사, 이 두 틀만 알면 하루가 다 풀립니다. time for bed, time for lunch, time to go, time to get up. 반대는 'It's time to get up.'",
   "It's time for bed — say goodnight to Mommy.","잘 시간이야, 엄마한테 잘 자 인사해."],
  ["침실","Go pick a book.","책 하나 골라와.",
   "pick 은 여럿 중 고르는 것으로 choose 보다 가볍고 아이에게 자주 씁니다. 수를 정해 주면 실랑이가 줄어드니 'Pick two books.' 처럼 숫자를 붙이는 게 요령입니다.",
   "Go pick a book — just one tonight.","책 하나 골라와, 오늘은 한 권만."],
  ["침실","Lights out.","불 끌게.",
   "원래 기숙사나 군대의 소등 신호에서 온 말인데 지금은 가정에서 '이제 잔다'는 신호로 씁니다. 스위치를 실제로 끄는 동작은 'Turn off the light.'",
   "Lights out — I'll leave the door open a little.","불 끌게, 문은 조금 열어 둘게."],
  ["침실","Sleep tight. Sweet dreams.","푹 자. 좋은 꿈 꿔.",
   "둘 다 잘 때만 쓰는 굳은 인사라 뜻을 따지지 않고 통째로 씁니다. tight 는 원래 '꽉'이지만 여기서는 '푹'에 해당합니다. 짧게는 'Night-night.'",
   "Good night, sleep tight. Sweet dreams.","잘 자, 푹 자. 좋은 꿈 꿔."],
  ["침실","Did you sleep well?","잘 잤어?",
   "아침 인사입니다. 대답까지 함께 익히게 하려면 'Good morning! Did you sleep well?' 로 묶어 주면 좋습니다. 뒤척였는지 물을 땐 'How did you sleep?'",
   "Good morning! Did you sleep well?","잘 잤어? 좋은 아침!"],

  /* ── 옷·놀이방 ──────────────────────────────────────── */
  ["옷·놀이방","Put it back.","제자리에 갖다 놔.",
   "back 한 글자에 '원래 있던 자리로'가 들어 있어서 장소를 따로 말할 필요가 없습니다. 어디인지 짚어 줄 땐 'Put it back on the shelf.'",
   "Put it back where you found it.","꺼낸 자리에 다시 갖다 놔."],
  ["옷·놀이방","Be gentle with it.","살살 다뤄야지.",
   "gentle 은 물건에도 사람에도 씁니다. 동생이나 강아지를 만질 때 쓰는 'Gentle hands.' 라는 짧은 말은 영어권에서 아주 자주 들립니다.",
   "Be gentle with it — it can break.","살살 다뤄야지, 부서져."],
  ["옷·놀이방","Pick out your clothes.","입을 옷을 골라봐.",
   "pick out 은 여럿 중에서 골라 꺼내는 것까지 포함합니다. 다만 세 살에게는 선택지를 둘로 좁혀 주는 'Blue one or red one?' 이 훨씬 잘 통합니다.",
   "Pick out your clothes — blue shirt or red one?","입을 옷 골라봐, 파란 거 아니면 빨간 거?"],
  ["옷·놀이방","Let's get dressed.","옷 입자.",
   "get dressed 는 옷을 갖춰 입는 과정 전체를 뜻합니다. 옷 한 벌을 콕 집어 말할 땐 put on 을 씁니다. 반대는 get undressed.",
   "Let's get dressed — school in ten minutes.","옷 입자, 10분 뒤에 유치원 가야 해."],
  ["옷·놀이방","Change into your pajamas.","잠옷으로 갈아입자.",
   "갈아입는 건 change into 로, into 가 있어야 '~로 갈아입다'가 됩니다. pajamas 는 늘 복수형이고, 줄여서 PJs 라고 아주 흔하게 씁니다.",
   "Bath's done — change into your PJs.","목욕 끝났으니까 잠옷으로 갈아입자."],
  ["옷·놀이방","Button it up. / Zip it up.","단추 잠가. / 지퍼 올려.",
   "단추와 지퍼가 그대로 동사로 쓰입니다. up 이 붙으면 '끝까지'라는 뜻이 더해지고, 반대는 unbutton / unzip 입니다.",
   "Zip it up — it's cold outside.","지퍼 올려, 밖에 추워."],

  /* ── 차 안 ──────────────────────────────────────────── */
  ["차 안","Get in the car.","차에 타자.",
   "승용차는 get in / get out, 버스·기차·비행기처럼 서서 다닐 수 있는 것은 get on / get off 입니다. 한국어에는 이 구분이 없어서 가장 자주 틀리는 자리입니다.",
   "Get in the car — I'll do your seatbelt.","차에 타자, 안전벨트는 아빠가 해줄게."],
  ["차 안","Buckle up.","안전벨트 매.",
   "buckle up 한 마디로 안전벨트를 매라는 뜻이 됩니다. 갖춰 말하면 'Put your seatbelt on.' 이고, 카시트에 앉히며 채워 줄 땐 'Let me buckle you in.'",
   "Everybody buckle up before we go.","출발 전에 다들 안전벨트 매."],
  ["차 안","Sit back, please.","등 붙이고 앉아.",
   "sit back 은 등받이에 등을 붙이는 자세입니다. 몸을 앞으로 빼거나 창 쪽으로 기울일 때 쓰고, 자세를 세우라는 sit up 과는 방향이 반대입니다.",
   "Sit back, please — all the way in your seat.","등 붙이고 앉아, 끝까지 쑥 들어가서."],
  ["차 안","We're almost there.","거의 다 왔어.",
   "목적지에 가까워졌을 때 쓰는 고정 표현입니다. 뒷자리 아이의 단골 질문 'Are we there yet?' 과 짝을 이룹니다.",
   "Almost there — two more songs.","거의 다 왔어, 노래 두 곡만 더."],
  ["차 안","We're here!","다 왔다!",
   "도착한 순간 쓰는 말로, arrive 같은 동사는 아이와의 대화에서 거의 쓰지 않습니다. 내릴 준비를 시키려면 'We're here — bags, please.'",
   "We're here! Grab your bag.","다 왔다! 가방 챙겨."],
  ["차 안","Stay in your seat.","자리에 앉아 있어.",
   "stay 는 '그 상태를 유지하라'는 뜻이라 일어서려는 아이를 붙잡는 자리에 딱 맞습니다. stay close(붙어 있어), stay here(여기 있어)도 같은 틀입니다.",
   "Stay in your seat until the car stops.","차 설 때까지 자리에 앉아 있어."]
];

export const SEED = SEED_ROWS.map((r, i) => ({
  id: "s" + (i + 1),
  seq: i + 1,
  situation: r[0],
  en: r[1],
  ko: r[2],
  nuance: r[3],
  exEn: r[4],
  exKo: r[5],
  note: r[6] || "",
  by: "기본",
  at: "2026-08-21",
  status: "done"
}));
