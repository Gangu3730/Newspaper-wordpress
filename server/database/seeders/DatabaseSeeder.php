<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \App\Models\News::truncate();
        \App\Models\Category::truncate();
        \App\Models\Advertisement::truncate();
        \App\Models\User::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create Admin
        $admin = User::create([
            'name' => 'प्रभात खबर ब्यूरो',
            'email' => 'admin@newsportal.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Categories
        $bihar = \App\Models\Category::create(['name' => 'बिहार', 'slug' => 'bihar', 'sort_order' => 1]);
        $jharkhand = \App\Models\Category::create(['name' => 'झारखंड', 'slug' => 'jharkhand', 'sort_order' => 2]);
        $desh = \App\Models\Category::create(['name' => 'देश', 'slug' => 'national', 'sort_order' => 3]);
        $videsh = \App\Models\Category::create(['name' => 'विदेश', 'slug' => 'international', 'sort_order' => 4]);
        $entertainment = \App\Models\Category::create(['name' => 'मनोरंजन', 'slug' => 'entertainment', 'sort_order' => 5]);
        $sports = \App\Models\Category::create(['name' => 'खेल', 'slug' => 'sports', 'sort_order' => 6]);
        $religion = \App\Models\Category::create(['name' => 'धर्म', 'slug' => 'religion', 'sort_order' => 7]);
        $lifestyle = \App\Models\Category::create(['name' => 'लाइफस्टाइल', 'slug' => 'lifestyle', 'sort_order' => 8]);
        $career = \App\Models\Category::create(['name' => 'करियर', 'slug' => 'career', 'sort_order' => 9]);
        $video = \App\Models\Category::create(['name' => 'वीडियो', 'slug' => 'video', 'sort_order' => 10]);

        // Breaking News (Ticker)
        \App\Models\News::create([
            'title' => 'बड़ी खबर: बिहार में मौसम विभाग का रेड अलर्ट, अगले 48 घंटों में भारी बारिश की चेतावनी',
            'slug' => 'bihar-weather-red-alert-heavy-rain',
            'summary' => 'मौसम विभाग ने राज्य के कई जिलों में भारी से अत्यधिक भारी बारिश का अलर्ट जारी किया है। लोगों से सतर्क रहने की अपील की गई है।',
            'content' => 'मौसम विभाग ने बिहार के कई हिस्सों में अगले 48 घंटों के भीतर मूसलाधार बारिश और वज्रपात का रेड अलर्ट जारी किया है। स्थानीय प्रशासन ने सभी स्कूलों को बंद रखने का निर्देश दिया है और लोगों को सुरक्षित स्थानों पर रहने की हिदायत दी है। आपदा प्रबंधन विभाग पूरी तरह सतर्क है।',
            'featured_image' => '/images/bihar.png',
            'category_id' => $bihar->id,
            'author_id' => $admin->id,
            'views' => 4820,
            'is_breaking' => true,
            'is_trending' => true,
            'is_sticky' => true,
            'status' => 'published',
            'published_at' => now(),
        ]);

        \App\Models\News::create([
            'title' => 'झारखंड में नई खेल नीति को मंजूरी, खिलाड़ियों को सरकारी नौकरियों में मिलेगा आरक्षण',
            'slug' => 'jharkhand-new-sports-policy-approved',
            'summary' => 'कैबिनेट ने खिलाड़ियों को प्रोत्साहित करने के लिए सरकारी नौकरियों में सीधी भर्ती और नकद पुरस्कारों की राशि बढ़ाने का फैसला किया है।',
            'content' => 'झारखंड सरकार ने राज्य में खेलों को बढ़ावा देने के लिए नई खेल नीति को मंजूरी दी है। इस नीति के तहत राष्ट्रीय और अंतरराष्ट्रीय स्तर पर पदक जीतने वाले खिलाड़ियों को सरकारी नौकरियों में आरक्षण दिया जाएगा, साथ ही छात्रवृत्ति और बुनियादी ढांचा सुविधाओं को मजबूत किया जाएगा।',
            'category_id' => $jharkhand->id,
            'author_id' => $admin->id,
            'views' => 1250,
            'is_breaking' => true,
            'is_trending' => false,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subMinutes(10),
        ]);

        // Bihar news
        \App\Models\News::create([
            'title' => 'पटना गोलघर के सौंदर्यीकरण का काम अंतिम चरण में, पर्यटकों के लिए जल्द खुलेगा नया लेजर शो',
            'slug' => 'patna-golghar-renovation-laser-show',
            'summary' => 'ऐतिहासिक पटना गोलघर को नया रूप देने और परिसर में हाई-टेक लेजर लाइट शो शुरू करने की तैयारियां पूरी हो चुकी हैं।',
            'content' => 'बिहार की राजधानी पटना का ऐतिहासिक स्थल गोलघर जल्द ही एक नए अवतार में पर्यटकों के सामने होगा। पर्यटन विभाग ने सौंदर्यीकरण और परिसर के जीर्णोद्धार का लगभग 95% काम पूरा कर लिया है। मुख्य आकर्षण एक 3D मैपिंग आधारित शानदार लेजर शो होगा, जिसमें बिहार के समृद्ध इतिहास की झलक दिखाई जाएगी। नया लाइटिंग सिस्टम और सुसज्जित पार्क पर्यटकों के अनुभव को और बेहतर बनाएंगे।',
            'featured_image' => '/images/bihar.png',
            'category_id' => $bihar->id,
            'author_id' => $admin->id,
            'views' => 2940,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => true,
            'status' => 'published',
            'published_at' => now()->subHours(1),
        ]);

        \App\Models\News::create([
            'title' => 'बिहार के राजगीर में बनेगा देश का सबसे बड़ा जू सफारी, पर्यटकों में बढ़ा उत्साह',
            'slug' => 'rajgir-zoo-safari-biggest-in-country',
            'summary' => 'राजगीर की वादियों में स्थित इस आधुनिक जू सफारी में पांच प्रकार के वन्य जीवों को खुले जंगल में देखने का मौका मिलेगा।',
            'content' => 'बिहार के ऐतिहासिक शहर राजगीर में देश की सबसे आधुनिक जू सफारी बनकर तैयार हो गई है। लगभग 177 हेक्टेयर क्षेत्र में फैली इस सफारी में शेर, बाघ, तेंदुए, भालू और हिरणों को खुले वातावरण में रखा गया है। पर्यटक पूरी तरह सुरक्षित कांच की बसों में बैठकर इन जानवरों को नजदीक से देख सकेंगे। यह पर्यटकों के लिए एक रोमांचक और अद्भुत अनुभव होगा।',
            'featured_image' => '/images/bihar.png',
            'category_id' => $bihar->id,
            'author_id' => $admin->id,
            'views' => 1920,
            'is_breaking' => false,
            'is_trending' => false,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(2),
        ]);

        // Jharkhand news
        \App\Models\News::create([
            'title' => 'रांची में बनेगा भव्य ट्राइबल म्यूजियम, झारखंड की संस्कृति और इतिहास को मिलेगी पहचान',
            'slug' => 'ranchi-tribal-museum-grand-opening',
            'summary' => 'केंद्रीय जनजातीय मंत्रालय की मदद से राज्य की जनजातीय विरासत को संजोने के लिए रांची में एक भव्य संग्रहालय बनाया जा रहा है।',
            'content' => 'रांची में बनने वाला यह भव्य ट्राइबल म्यूजियम राज्य की सभी 32 जनजातियों के इतिहास, कला, संस्कृति, जीवन शैली और स्वतंत्रता आंदोलन में उनके योगदान को दर्शाएगा। इसमें एक हाई-टेक 3D थियेटर, डिजिटल लाइब्रेरी और पारंपरिक कलाकृतियों के लिए विशेष गैलरी बनाई जाएगी। यह संग्रहालय न केवल शोधकर्ताओं बल्कि सैलानियों के लिए भी आकर्षण का मुख्य केंद्र होगा।',
            'featured_image' => '/images/religion.png',
            'category_id' => $jharkhand->id,
            'author_id' => $admin->id,
            'views' => 2100,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(3),
        ]);

        // Entertainment
        \App\Models\News::create([
            'title' => 'बॉलीवुड फिल्म फेस्टिवल 2026: भव्य उद्घाटन समारोह में पहुंचे भारतीय सिनेमा के कई बड़े सितारे',
            'slug' => 'bollywood-film-festival-grand-opening',
            'summary' => 'मुंबई में आयोजित अंतरराष्ट्रीय फिल्म महोत्सव की शुरुआत रंगारंग प्रस्तुतियों और सिनेमा जगत की दिग्गज हस्तियों की मौजूदगी के साथ हुई।',
            'content' => 'मुंबई में आयोजित इस साल के सबसे बड़े बॉलीवुड फिल्म फेस्टिवल का आगाज हो चुका है। समारोह के दौरान भारतीय सिनेमा में असाधारण योगदान के लिए लाइफटाइम अचीवमेंट पुरस्कारों की घोषणा की गई। कई आगामी बड़े बजट की फिल्मों के फर्स्ट लुक और ट्रेलरों का भी अनावरण किया गया, जिससे प्रशंसकों के बीच उत्साह बढ़ गया है।',
            'featured_image' => '/images/entertainment.png',
            'category_id' => $entertainment->id,
            'author_id' => $admin->id,
            'views' => 3890,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(4),
        ]);

        // Religion
        \App\Models\News::create([
            'title' => 'सावन मेला 2026: देवघर बाबा धाम मंदिर में श्रद्धालुओं की भारी भीड़, सुरक्षा के पुख्ता इंतजाम',
            'slug' => 'devghar-baba-dham-sawan-mela',
            'summary' => 'प्रसिद्ध बाबा बैद्यनाथ मंदिर में जलार्पण के लिए लाखों कांवरियों की लंबी कतारें लगी हैं। प्रशासन ने सुरक्षा और स्वास्थ्य सुविधाओं के कड़े प्रबंध किए हैं।',
            'content' => 'पवित्र सावन महीने की शुरुआत के साथ ही झारखंड के देवघर स्थित बाबा बैद्यनाथ धाम में हर-हर महादेव के जयघोष गूंज रहे हैं। प्रशासन ने सीसीटीवी कैमरों, ड्रोन कैमरों और हजारों पुलिस बल की तैनाती की है ताकि श्रद्धालुओं को किसी परेशानी का सामना न करना पड़े। जगह-जगह सेवा शिविर भी लगाए गए हैं।',
            'featured_image' => '/images/religion.png',
            'category_id' => $religion->id,
            'author_id' => $admin->id,
            'views' => 5900,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(6),
        ]);

        // Sports
        \App\Models\News::create([
            'title' => 'वर्ल्ड टी-20 कप: भारत ने शानदार प्रदर्शन करते हुए फाइनल में बनाई जगह, देशभर में जश्न का माहौल',
            'slug' => 'world-t20-cup-india-enters-final',
            'summary' => 'सेमीफाइनल के रोमांचक मुकाबले में भारतीय टीम ने ऑस्ट्रेलिया को 15 रनों से हराकर फाइनल में प्रवेश कर लिया है।',
            'content' => 'भारतीय क्रिकेट टीम ने वर्ल्ड टी-20 कप के सेमीफाइनल मुकाबले में शानदार खेल का प्रदर्शन करते हुए ऑस्ट्रेलिया को हरा दिया। विराट कोहली की बेहतरीन अर्धशतकीय पारी और जसप्रीत बुमराह की धारदार गेंदबाजी के दम पर भारत ने यह ऐतिहासिक जीत हासिल की। पूरे देश में खेल प्रेमी पटाखे फोड़कर जश्न मना रहे हैं। फाइनल मैच आगामी रविवार को खेला जाएगा।',
            'featured_image' => '/images/quantum.png',
            'category_id' => $sports->id,
            'author_id' => $admin->id,
            'views' => 4500,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(7),
        ]);

        // National
        \App\Models\News::create([
            'title' => 'डिजिटल इंडिया अभियान: ग्रामीण क्षेत्रों में हाई-स्पीड इंटरनेट पहुंचाने की गति में दोगुनी तेजी',
            'slug' => 'digital-india-rural-internet-expansion',
            'summary' => 'सरकार ने भारतनेट परियोजना के तहत दूरदराज के गांवों में ऑप्टिकल फाइबर बिछाने के लिए नए फंड और तकनीकों को मंजूरी दी है।',
            'content' => 'ग्रामीण भारत को डिजिटल रूप से सशक्त बनाने की दिशा में एक बड़ी छलांग लगाते हुए, दूरसंचार मंत्रालय ने दूरस्थ क्षेत्रों में फाइबर-टू-द-होम कनेक्टिविटी को बढ़ावा दिया है। इससे न केवल शिक्षा बल्कि ग्रामीण स्वास्थ्य सुविधाओं और स्थानीय व्यापार को भी एक नई दिशा मिलेगी।',
            'featured_image' => '/images/quantum.png',
            'category_id' => $desh->id,
            'author_id' => $admin->id,
            'views' => 1920,
            'is_breaking' => false,
            'is_trending' => false,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(8),
        ]);

        // International
        \App\Models\News::create([
            'title' => 'जलवायु परिवर्तन सम्मेलन 2026: वैश्विक नेताओं ने कार्बन उत्सर्जन घटाने के नए संकल्प पर किए हस्ताक्षर',
            'slug' => 'climate-change-summit-carbon-emission-pact',
            'summary' => 'संयुक्त राष्ट्र के तत्वावधान में आयोजित वैश्विक शिखर सम्मेलन में 150 से अधिक देशों ने ग्रीनहाउस गैसों में 40% की कटौती करने पर सहमति जताई।',
            'content' => 'ग्लोबल वार्मिंग से निपटने के लिए ऐतिहासिक जिनेवा जलवायु सम्मेलन में एक बड़ा फैसला लिया गया है। विकसित और विकासशील देशों ने एकजुट होकर औद्योगिक उत्सर्जन को कम करने, रिन्यूएबल एनर्जी को अपनाने और गरीब देशों को क्लाइमेट फंड प्रदान करने पर सहमति दी है। पर्यावरणविदों ने इसे एक उम्मीद की किरण बताया है।',
            'featured_image' => '/images/quantum.png',
            'category_id' => $videsh->id,
            'author_id' => $admin->id,
            'views' => 2800,
            'is_breaking' => false,
            'is_trending' => false,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(9),
        ]);

        // Career
        \App\Models\News::create([
            'title' => 'बिहार लोक सेवा आयोग (BPSC) भर्ती: 800 से अधिक प्रशासनिक पदों के लिए अधिसूचना जारी, आवेदन प्रक्रिया शुरू',
            'slug' => 'bpsc-civil-services-recruitment-notification',
            'summary' => 'इच्छुक अभ्यर्थी आधिकारिक वेबसाइट पर जाकर ऑनलाइन आवेदन कर सकते हैं। परीक्षा का आयोजन आगामी अक्टूबर माह में प्रस्तावित है।',
            'content' => 'बीपीएससी ने विभिन्न सरकारी विभागों में रिक्त प्रशासनिक अधिकारियों और पुलिस उपाधीक्षक पदों पर भर्ती के लिए ऑनलाइन आवेदन आमंत्रित किए हैं। इस वर्ष कुल 824 रिक्तियों की घोषणा की गई है। आयोग ने परीक्षा पैटर्न को अधिक पारदर्शी बनाने के लिए नए सुरक्षा मानकों की भी शुरुआत की है। आवेदन की अंतिम तिथि अगले माह की 15 तारीख तय की गई है।',
            'featured_image' => '/images/bihar.png',
            'category_id' => $career->id,
            'author_id' => $admin->id,
            'views' => 7430,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(10),
        ]);

        // Lifestyle
        \App\Models\News::create([
            'title' => 'स्वस्थ दिनचर्या और योग: तनावमुक्त जीवन जीने के लिए अपनाएं ये 5 आसान और असरदार योगासन',
            'slug' => 'healthy-lifestyle-yoga-tips-stress-free',
            'summary' => 'दौड़भाग भरी जिंदगी में मानसिक शांति और शारीरिक तंदुरुस्ती पाने के लिए योग एक बेहतरीन विकल्प है। जानिए सही तरीके।',
            'content' => 'आधुनिक जीवनशैली में काम का दबाव और तनाव आम बात है। विशेषज्ञों का मानना है कि सुबह केवल 20 मिनट का प्राणायाम, सूर्य नमस्कार और ध्यान करने से मानसिक सजगता बढ़ती है और दिनभर ऊर्जा बनी रहती है। योग न केवल वजन को नियंत्रित रखता है बल्कि दिल की सेहत के लिए भी वरदान साबित होता है। इसे अपने दैनिक जीवन का हिस्सा जरूर बनाएं।',
            'featured_image' => '/images/religion.png',
            'category_id' => $lifestyle->id,
            'author_id' => $admin->id,
            'views' => 3120,
            'is_breaking' => false,
            'is_trending' => false,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(12),
        ]);

        // Video mock
        \App\Models\News::create([
            'title' => 'EXCLUSIVE: राजगीर ग्लास ब्रिज के ऊपर से देखिए विहंगम दृश्य, पर्यटकों का उमड़ा भारी हुजूम',
            'slug' => 'rajgir-glass-bridge-exclusive-video-tour',
            'summary' => 'पर्यटकों में लोकप्रिय हो रहे बिहार के इस पहले स्काईवॉक ब्रिज का रोमांचक वीडियो अनुभव।',
            'content' => 'राजगीर की सुरम्य पहाड़ियों के बीच बने पांच पहाड़ियों से घिरे इस शानदार ग्लास स्काईवॉक ब्रिज का विहंगम और अद्भुत दृश्य सैलानियों को रोमांचित कर रहा है। सुरक्षा के सुरक्षात्मक नियमों और गाइडों की टीम यहां पूरी तत्परता से काम कर रही है। पर्यटकों की सुरक्षा के लिए खास नियम लागू किए गए हैं। देखिए यह एक्सक्लूसिव वीडियो रिपोर्ट।',
            'featured_image' => '/images/bihar.png',
            'category_id' => $video->id,
            'author_id' => $admin->id,
            'views' => 8900,
            'is_breaking' => false,
            'is_trending' => true,
            'is_sticky' => false,
            'status' => 'published',
            'published_at' => now()->subHours(14),
        ]);

        // Seed some Advertisements
        \App\Models\Advertisement::create([
            'title' => 'Top Header Sponsor Banner',
            'image_url' => 'https://placehold.co/728x90/d32f2f/ffffff?text=प्रभात+खबर+डिजिटल+-+विज्ञापन',
            'target_url' => 'https://epaper.prabhatkhabar.com',
            'placement' => 'header',
            'is_active' => true,
        ]);

        \App\Models\Advertisement::create([
            'title' => 'Homepage Middle Section Banner',
            'image_url' => 'https://placehold.co/970x90/333333/ffffff?text=विज्ञापन+-+स्पॉन्सर्ड+कंटेंट+-+Sponsor+Ad',
            'target_url' => 'https://www.prabhatkhabar.com',
            'placement' => 'footer',
            'is_active' => true,
        ]);
    }
}
