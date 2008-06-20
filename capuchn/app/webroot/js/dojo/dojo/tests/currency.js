if(!dojo._hasResource["tests.currency"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["tests.currency"] = true;
dojo.provide("tests.currency");

dojo.require("dojo.currency");

tests.register("tests.currency", 
	[
		{
			// Test formatting and parsing of currencies in various locales pre-built in dojo.cldr
			// NOTE: we can't set djConfig.extraLocale before bootstrapping unit tests, so directly
			// load resources here for specific locales:

			name: "currency",
			setUp: function(){
				var partLocaleList = ["en-us", "en-ca", "de-de"];
				for(var i = 0 ; i < partLocaleList.length; i ++){
					dojo.requireLocalization("dojo.cldr","currency",partLocaleList[i], "pt,ja,es,en-us,ROOT,zh,zh-tw,de,fr,en,it,en-ca,ko,en-au");
					dojo.requireLocalization("dojo.cldr","number",partLocaleList[i], "de-de,ROOT,pt,en-gb,ko-kr,ja,es,en-us,zh,zh-tw,de,zh-cn,fr,en,it,ko,es-es,ja-jp,en-au");
				}
			},
			runTest: function(t){
				t.is("\u20ac123.45", dojo.currency.format(123.45, {currency: "EUR", locale: "en-us"}));
				t.is("$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-us"}));
				t.is("$1,234.56", dojo.currency.format(1234.56, {currency: "USD", locale: "en-us"}));
				t.is("US$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-ca"}));
				t.is("$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-ca"}));
				t.is("Can$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-us"}));
				t.is("123,45 \u20ac", dojo.currency.format(123.45, {currency: "EUR", locale: "de-de"}));
				t.is("1.234,56 \u20ac", dojo.currency.format(1234.56, {currency: "EUR", locale: "de-de"}));
				// There is no special currency symbol for ADP, so expect the ISO code instead
				t.is("ADP123", dojo.currency.format(123, {currency: "ADP", locale: "en-us"}));

				t.is(123.45, dojo.currency.parse("$123.45", {currency: "USD", locale: "en-us"}));
				t.is(1234.56, dojo.currency.parse("$1,234.56", {currency: "USD", locale: "en-us"}));
				t.is(123.45, dojo.currency.parse("123,45 \u20ac", {currency: "EUR", locale: "de-de"}));
				t.is(1234.56, dojo.currency.parse("1.234,56 \u20ac", {currency: "EUR", locale: "de-de"}));
				t.is(1234.56, dojo.currency.parse("1.234,56\u20ac", {currency: "EUR", locale: "de-de"}));

				t.is(1234, dojo.currency.parse("$1,234", {currency: "USD", locale: "en-us"}));
				t.is(1234, dojo.currency.parse("$1,234", {currency: "USD", fractional: false, locale: "en-us"}));
				t.t(isNaN(dojo.currency.parse("$1,234", {currency: "USD", fractional: true, locale: "en-us"})));
			}
		}
	]
);

}
