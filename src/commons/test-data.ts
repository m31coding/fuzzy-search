/**
 * Provides test data for unit tests.
 */
export class TestData {
  /**
   * First names and last names created with Faker (latin locales).
   */
  public static readonly persons: { firstName: string; lastName: string }[] = [
    {
      firstName: 'Katharina',
      lastName: 'Rau'
    },
    {
      firstName: 'Rosalinda',
      lastName: 'Stiedemann'
    },
    {
      firstName: 'Karley',
      lastName: 'Kassulke'
    },
    {
      firstName: 'Linda',
      lastName: 'Hoppe'
    },
    {
      firstName: 'Hunter',
      lastName: 'Toy'
    },
    {
      firstName: 'Anahi',
      lastName: 'Goldner-Hoppe'
    },
    {
      firstName: 'Jasper',
      lastName: 'Schulist'
    },
    {
      firstName: 'Junior',
      lastName: 'Mante'
    },
    {
      firstName: 'Glen',
      lastName: 'Smith'
    },
    {
      firstName: 'Antonetta',
      lastName: 'Bogisich'
    },
    {
      firstName: 'Lydia',
      lastName: 'Hills'
    },
    {
      firstName: 'Rita',
      lastName: 'Satterfields-Connelly'
    },
    {
      firstName: 'Sarah',
      lastName: 'Wolff'
    },
    {
      firstName: 'Jaren',
      lastName: 'Schmidt'
    },
    {
      firstName: 'Jakayla',
      lastName: 'Sauer'
    },
    {
      firstName: 'Marielle',
      lastName: 'Reichel'
    },
    {
      firstName: 'Lucie',
      lastName: 'Conroy'
    },
    {
      firstName: 'Kale',
      lastName: 'Rosenbaum'
    },
    {
      firstName: 'Joy',
      lastName: 'Johns'
    },
    {
      firstName: 'Jaren',
      lastName: 'Dibbert'
    },
    {
      firstName: 'Jesús',
      lastName: 'Berríos Araña'
    },
    {
      firstName: 'Fidèle',
      lastName: 'Barre'
    },
    {
      firstName: 'Božica',
      lastName: 'Jagrić'
    },
    {
      firstName: 'Marie',
      lastName: 'Løken'
    }
  ];

  /**
   * First names and last names created with Faker (non-latin locales).
   */
  public static readonly personsNonLatin: { firstName: string; lastName: string }[] = [
    {
      firstName: 'سعيد',
      lastName: 'راشد'
    },
    {
      firstName: 'گلپایگانی',
      lastName: 'کامبخش'
    },
    {
      firstName: 'آفریدی',
      lastName: 'عثمان'
    },
    {
      firstName: 'Ռուբեն',
      lastName: 'Մնացականյան'
    },
    {
      firstName: 'Гроздан',
      lastName: 'Хаџиниколов'
    },
    {
      firstName: 'Валерия',
      lastName: '' // no faker data
    },
    {
      firstName: 'Пантелеймон',
      lastName: '' // no faker data
    },
    {
      firstName: 'ნათელა',
      lastName: 'ზუბიაშვილი'
    },
    {
      firstName: 'Κώστας',
      lastName: 'Κοντολέων'
    },
    {
      firstName: '昊然',
      lastName: '邵'
    },
    {
      firstName: '正豪',
      lastName: '朱'
    },
    {
      firstName: 'עלמא',
      lastName: 'שפע'
    },
    {
      firstName: '結衣',
      lastName: '山口'
    },
    {
      firstName: '형민',
      lastName: '함'
    },
    {
      firstName: 'އިލްޔާސް',
      lastName: 'ފާއިޤު'
    },
    {
      firstName: '', // no faker data
      lastName: 'สมตระกูล'
    }
  ];

  /**
   * Empty persons for testing the robustness of our implementation.
   */
  public static readonly emptyPersons: { firstName: string; lastName: string }[] = [
    {
      firstName: '',
      lastName: ''
    },
    {
      firstName: null!,
      lastName: null!
    },
    {
      firstName: undefined!,
      lastName: undefined!
    }
  ];
}
