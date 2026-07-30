package com.splitwise.config;

import com.splitwise.entity.*;
import com.splitwise.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.logging.Logger;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(DataInitializer.class.getName());

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           GroupRepository groupRepository,
                           GroupMemberRepository groupMemberRepository,
                           ExpenseRepository expenseRepository,
                           ExpenseSplitRepository expenseSplitRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initialization.");
            return;
        }

        logger.info("Seeding initial database data...");

        // Create Users
        User alice = userRepository.save(new User("Alice Smith", "alice@example.com", passwordEncoder.encode("password123")));
        User bob = userRepository.save(new User("Bob Johnson", "bob@example.com", passwordEncoder.encode("password123")));
        User charlie = userRepository.save(new User("Charlie Brown", "charlie@example.com", passwordEncoder.encode("password123")));

        // Create Group 1: Goa Vacation 2026
        Group goaGroup = groupRepository.save(new Group(
                "Goa Trip 2026",
                "Beach, seafood, and resort trip expenses",
                "Travel",
                "GOA2026",
                alice
        ));

        groupMemberRepository.save(new GroupMember(goaGroup, alice));
        groupMemberRepository.save(new GroupMember(goaGroup, bob));
        groupMemberRepository.save(new GroupMember(goaGroup, charlie));

        // Create Group 2: Apartment 304
        Group flatGroup = groupRepository.save(new Group(
                "Apartment 304",
                "Monthly rent, wifi, utilities, and groceries",
                "Flatmates",
                "FLAT304",
                bob
        ));

        groupMemberRepository.save(new GroupMember(flatGroup, alice));
        groupMemberRepository.save(new GroupMember(flatGroup, bob));

        // Expense 1: Beach Shack Dinner ($150 paid by Alice, Equal split $50 each)
        Expense expense1 = new Expense(goaGroup, "Beach Shack Dinner & Drinks", new BigDecimal("150.00"), "Food", alice, SplitType.EQUAL);
        expense1 = expenseRepository.save(expense1);

        ExpenseSplit split1A = new ExpenseSplit(expense1, alice, new BigDecimal("50.00"), new BigDecimal("33.33"));
        ExpenseSplit split1B = new ExpenseSplit(expense1, bob, new BigDecimal("50.00"), new BigDecimal("33.33"));
        ExpenseSplit split1C = new ExpenseSplit(expense1, charlie, new BigDecimal("50.00"), new BigDecimal("33.34"));
        expenseSplitRepository.saveAll(List.of(split1A, split1B, split1C));

        // Expense 2: Airport Taxi ($60 paid by Bob, Equal split $20 each)
        Expense expense2 = new Expense(goaGroup, "Airport Prepaid Cab", new BigDecimal("60.00"), "Transport", bob, SplitType.EQUAL);
        expense2 = expenseRepository.save(expense2);

        ExpenseSplit split2A = new ExpenseSplit(expense2, alice, new BigDecimal("20.00"), new BigDecimal("33.33"));
        ExpenseSplit split2B = new ExpenseSplit(expense2, bob, new BigDecimal("20.00"), new BigDecimal("33.33"));
        ExpenseSplit split2C = new ExpenseSplit(expense2, charlie, new BigDecimal("20.00"), new BigDecimal("33.34"));
        expenseSplitRepository.saveAll(List.of(split2A, split2B, split2C));

        // Expense 3: Supermarket Groceries ($90 paid by Charlie, Exact split: Alice $40, Bob $30, Charlie $20)
        Expense expense3 = new Expense(goaGroup, "Villa Groceries & Drinks", new BigDecimal("90.00"), "Groceries", charlie, SplitType.EXACT);
        expense3 = expenseRepository.save(expense3);

        ExpenseSplit split3A = new ExpenseSplit(expense3, alice, new BigDecimal("40.00"), null);
        ExpenseSplit split3B = new ExpenseSplit(expense3, bob, new BigDecimal("30.00"), null);
        ExpenseSplit split3C = new ExpenseSplit(expense3, charlie, new BigDecimal("20.00"), null);
        expenseSplitRepository.saveAll(List.of(split3A, split3B, split3C));

        logger.info("Database seeding completed successfully.");
    }
}
