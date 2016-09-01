import re


SOURCE_FILE = 'draft.txt'
TARGET_FILE = 'parsed_draft.txt'

PAGE_PATTERN = 'p[0-9]{1,3}'


def main():
    target_file = open(TARGET_FILE, 'w')
    with open(SOURCE_FILE, 'r') as source_file:
        subtitle_count = 0
        for line in source_file:
            # Pass null line
            if not line:
                continue

            # draft.txt has 2 kinds:
            # (1) chapter: Working with Data Serialization
            # (2) page and subtitle: p59 Converting an object to JSON and back
            match = re.match(PAGE_PATTERN, line)
            has_page = 1 if match else 0

            if has_page:
                list_ = line.lower().split(' ')
                list_[0] = "%02d" % (subtitle_count,)
                subtitle_count += 1
                number_title_str = '-'.join(list_)
                target_file.write(number_title_str)

            str_ = line.lower().replace(' ', '-')
            target_file.write(str_)
    target_file.close()


if __name__ == '__main__':
    main()
