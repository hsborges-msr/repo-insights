'use client';

import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  UseDisclosureProps,
  useDisclosure
} from '@heroui/react';
import { IconTrash } from '@tabler/icons-react';
import numeral from 'numeral';
import { useCallback, useReducer } from 'react';
import { useAsync } from 'react-use';

export default function CacheManager(props: UseDisclosureProps) {
  const { isOpen, onOpenChange, onClose } = useDisclosure(props);

  const [version, forceUpdate] = useReducer((x) => x + 1, 1);

  const usage = useAsync(async () => (await navigator.storage.estimate()).usage, []);

  const databases = useAsync(async () => {
    const dbs = await indexedDB.databases();
    const data = await Promise.all(dbs.map(async (db) => ({ name: db.name!, version: db.version!, deleted: false })));
    return data.filter((db) => db.name.match(/(.*)\/(.*)$/g));
  }, [version]);

  const confirmDeletion = useCallback(
    (name: string) => {
      const response = confirm(`Are you sure you want to delete the cache for ${name}?`);
      if (response) {
        databases.value!.find((db) => db.name === name)!.deleted = true;
        indexedDB.deleteDatabase(name).onsuccess = () => forceUpdate();
      }
    },
    [databases.value]
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      placement="top-center"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>Cache information</ModalHeader>
        <ModalBody>
          <p className="italic text-justify text-gray-600">
            This application uses IndexedDB to store data locally, ensuring faster data collection and retrieval. By
            leveraging IndexedDB, the app can work efficiently even with limited internet connectivity.
          </p>
          {databases.value?.length ? (
            <>
              <p className="border-y text-center text-sm text-gray-600" hidden={!usage.value}>
                Estimated usage: <span className="text-red-400">{numeral(usage.value).format('0.0b')}</span>
              </p>
              <p>At the moment, we have cached data from the following repositories:</p>
            </>
          ) : (
            <p>At the moment, you do not have any data cached in your browser :)</p>
          )}

          <ul className="list-disc list-inside">
            {version &&
              databases.value?.map((db) => (
                <li key={db.name}>
                  <div className="inline-flex items-center">
                    <span>
                      <Link href={`/r/${db.name}`} color="foreground" className={db.deleted ? 'line-through' : ''}>
                        {db.name}
                      </Link>
                      <span className="px-1 text-gray-600 text-sm">(db_version: {db.version})</span>
                    </span>
                    <Link
                      onPress={() => confirmDeletion(db.name)}
                      className="hover:cursor-pointer"
                      isDisabled={db.deleted}
                    >
                      <IconTrash size={20} className="inline text-red-500" />
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
