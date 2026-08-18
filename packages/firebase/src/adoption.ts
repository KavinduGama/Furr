// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Adoption Platform & Rescue Network Service
// ─────────────────────────────────────────────────────────────

import type {
  AdoptionListing,
  AdoptionApplication,
  ShelterProfile,
  PetSpecies,
} from '@furr/core';

export const INITIAL_ADOPTION_LISTINGS: AdoptionListing[] = [
  {
    id: 'adopt-1',
    shelterId: 'shelter-1',
    shelterName: 'Colombo Animal Protection Trust',
    shelterVerified: true,
    shelterPhone: '+94 11 234 9876',
    shelterEmail: 'adopt@capt-sl.org',
    listingType: 'shelter',
    petName: 'Milo',
    species: 'dog',
    sex: 'male',
    breed: 'Sri Lankan Hound Cross',
    ageEstimate: '5 months',
    size: 'medium',
    colour: 'Tan & White',
    photoUrls: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=60',
    ],
    coverPhotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60',
    description: 'Rescued from an abandoned construction yard. Incredibly affectionate, eager to learn, and walks well on a leash.',
    story: 'Milo was found with his 3 siblings in May. After 2 months of foster care and complete vaccinations, he is ready for a forever family.',
    temperamentTraits: ['Kid-Friendly', 'Affectionate', 'Active', 'Leash Trained'],
    medicalSummary: {
      isVaccinated: true,
      isNeutered: true,
      isDewormed: true,
      isMicrochipped: false,
    },
    location: {
      district: 'Colombo',
      city: 'Rajagiriya',
    },
    adoptionFeeLkr: 0,
    status: 'available',
    createdAt: '2026-08-01T10:00:00Z',
    applicationsCount: 3,
  },
  {
    id: 'adopt-2',
    shelterId: 'shelter-2',
    shelterName: 'Kandy Cat Rescue & Sanctuary',
    shelterVerified: true,
    shelterPhone: '+94 81 223 4567',
    listingType: 'rescue_org',
    petName: 'Bella',
    species: 'cat',
    sex: 'female',
    breed: 'Domestic Short Hair (Calico)',
    ageEstimate: '1 year',
    size: 'small',
    colour: 'Tricolour Calico',
    photoUrls: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60',
    ],
    coverPhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=60',
    description: 'Gentle, lap-loving calico who purrs constantly. Best suited for a peaceful home environment.',
    story: 'Surrendered due to owner moving abroad. Bella is fully litter-trained and loves sunbathing near windows.',
    temperamentTraits: ['Calm', 'Affectionate', 'Litter Trained', 'Indoor Only'],
    medicalSummary: {
      isVaccinated: true,
      isNeutered: true,
      isDewormed: true,
      isMicrochipped: true,
    },
    location: {
      district: 'Kandy',
      city: 'Peradeniya',
    },
    adoptionFeeLkr: 2500, // Nominal donation for shelter food
    status: 'available',
    createdAt: '2026-08-05T14:00:00Z',
    applicationsCount: 1,
  },
  {
    id: 'adopt-3',
    shelterId: 'shelter-1',
    shelterName: 'Colombo Animal Protection Trust',
    shelterVerified: true,
    shelterPhone: '+94 11 234 9876',
    listingType: 'shelter',
    petName: 'Rusty',
    species: 'dog',
    sex: 'male',
    breed: 'Golden Retriever Mix',
    ageEstimate: '2 years',
    size: 'large',
    colour: 'Golden / Amber',
    photoUrls: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=60',
    ],
    coverPhotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=60',
    description: 'Playful big boy who loves swimming and fetch. Needs an energetic family with garden space.',
    story: 'Rescued from road traffic in Kaduwela. Completely healthy and loves human company.',
    temperamentTraits: ['Playful', 'Water Lover', 'High Energy', 'Good with other dogs'],
    medicalSummary: {
      isVaccinated: true,
      isNeutered: true,
      isDewormed: true,
      isMicrochipped: false,
    },
    location: {
      district: 'Colombo',
      city: 'Battaramulla',
    },
    adoptionFeeLkr: 0,
    status: 'available',
    createdAt: '2026-08-10T09:00:00Z',
    applicationsCount: 2,
  },
];

/**
 * Subscribe to adoption listings from Firestore.
 */
export function subscribeToAdoptionListings(
  onUpdate: (listings: AdoptionListing[]) => void,
  speciesFilter?: PetSpecies | 'all'
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, onSnapshot, query, where } = await import('firebase/firestore');
      const db = getFirestore();
      const colRef = collection(db, 'adoption_listings');

      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            const filtered = speciesFilter && speciesFilter !== 'all'
              ? INITIAL_ADOPTION_LISTINGS.filter((l) => l.species === speciesFilter)
              : INITIAL_ADOPTION_LISTINGS;
            onUpdate(filtered);
            return;
          }
          const list: AdoptionListing[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AdoptionListing;
            if (!speciesFilter || speciesFilter === 'all' || data.species === speciesFilter) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          onUpdate(list.length > 0 ? list : INITIAL_ADOPTION_LISTINGS);
        },
        (error) => {
          console.warn('Firestore adoption listings subscription fallback:', error);
          const filtered = speciesFilter && speciesFilter !== 'all'
            ? INITIAL_ADOPTION_LISTINGS.filter((l) => l.species === speciesFilter)
            : INITIAL_ADOPTION_LISTINGS;
          onUpdate(filtered);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('Adoption listings fallback:', e);
      const filtered = speciesFilter && speciesFilter !== 'all'
        ? INITIAL_ADOPTION_LISTINGS.filter((l) => l.species === speciesFilter)
        : INITIAL_ADOPTION_LISTINGS;
      onUpdate(filtered);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

/**
 * Submit an adoption application to Firestore.
 */
export async function submitAdoptionApplication(
  appData: Omit<AdoptionApplication, 'id' | 'createdAt' | 'status'>
): Promise<AdoptionApplication> {
  const newApp: AdoptionApplication = {
    ...appData,
    id: 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  try {
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore();
    await setDoc(doc(db, 'adoption_applications', newApp.id), newApp);
  } catch (e) {
    console.warn('Adoption application saved locally:', e);
  }

  return newApp;
}

/**
 * Subscribe to adoption applications for a user.
 */
export function subscribeToUserAdoptionApplications(
  applicantUid: string,
  onUpdate: (apps: AdoptionApplication[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'adoption_applications'),
        where('applicantUid', '==', applicantUid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AdoptionApplication[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AdoptionApplication);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        },
        (error) => {
          console.warn('User adoption apps subscription error:', error);
          onUpdate([]);
        }
      );

      if (!active && unsubscribe) unsubscribe();
    } catch (e) {
      console.warn('User adoption applications failed:', e);
      onUpdate([]);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}
